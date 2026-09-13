import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, writeFile, readFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const deployment = resolve(import.meta.dirname, '..');
const harness = resolve(deployment, '../..');
const plugin = resolve(process.argv[2] ?? join(harness, '../dsh-learning-helper'));
const { browserSmoke } = await import(pathToFileURL(join(plugin, 'scripts/browser-smoke.mjs')));
const work = await mkdtemp(join(tmpdir(), 'learning-helper-docker-'));
const project = 'lh-acceptance-' + Date.now();
const record = { startedAt: new Date().toISOString(), status: 'running', project, versions: JSON.parse(await readFile(join(deployment, 'versions.lock.json'), 'utf8')) };
const artifact = join(plugin, 'artifacts/docker-result.json');
await mkdir(join(plugin, 'artifacts'), { recursive: true });
const docker = process.env.DOCKER_BIN ?? 'docker';
const args = ['compose', '-p', project, '-f', join(deployment, 'compose.yml'), '-f', join(work, 'acceptance.yml')];
const scrub = s => s.replace(/([?&]token=)[^\s"'<>]+/g, '$1[REDACTED]');
async function run(extra, timeout = 120_000) {
  const child = spawn(docker, [...args, ...extra], { cwd: deployment, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; let timedOut = false;
  for (const stream of [child.stdout, child.stderr]) stream.on('data', b => { log = (log + b).slice(-1_048_576); });
  const timer = setTimeout(() => { timedOut = true; process.kill(-child.pid, 'SIGKILL'); }, timeout);
  try { const [code] = await once(child, 'exit'); assert.ok(!timedOut && code === 0, scrub(log).slice(-5000)); return log; }
  finally { clearTimeout(timer); }
}
let created = false;
try {
  await writeFile(join(work, 'probe.patch.yml'), `- insert:\n    - id: learning-helper-test-probe\n      name: /opt/runtime/acceptance/tool-probe.mjs\n      config:\n        workspace: /data/acceptance\n`);
  await writeFile(join(work, 'acceptance.yml'), `services:\n  learning-helper:\n    image: ${project}:test\n    command: ["--patch", "/opt/runtime/acceptance/probe.patch.yml"]\n    volumes:\n      - ${JSON.stringify(join(plugin, 'scripts/tool-probe.mjs') + ':/opt/runtime/acceptance/tool-probe.mjs:ro')}\n      - ${JSON.stringify(join(work, 'probe.patch.yml') + ':/opt/runtime/acceptance/probe.patch.yml:ro')}\n`);
  record.noCache = process.env.LH_DOCKER_USE_CACHE !== '1';
  console.log(`Docker acceptance: building pinned sources (${record.noCache ? 'no cache' : 'cached diagnostic'})`);
  await run(['build', ...(record.noCache ? ['--no-cache'] : [])], 3_600_000); record.build = 'PASS';
  created = true; await run(['up', '-d', '--wait', '--wait-timeout', '120']); record.coldBoot = 'PASS';
  async function connect() {
    const url = (await run(['exec', '-T', 'learning-helper', 'node', '/opt/learning-helper/open.mjs'])).trim();
    const base = new URL(url).origin;
    const exchange = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000) });
    assert.equal(exchange.status, 303); const cookie = exchange.headers.get('set-cookie')?.split(';')[0]; assert.ok(cookie);
    const get = path => fetch(base + path, { headers: { cookie }, signal: AbortSignal.timeout(10_000) });
    const post = (path, body) => fetch(base + path, { method: 'POST', headers: { cookie, origin: base, 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(12_000) });
    assert.equal((await fetch(base + '/learning-helper/v1/health', { signal: AbortSignal.timeout(5000) })).status, 401);
    assert.equal((await fetch(base + '/learning-helper/v1/health', { headers: { cookie, origin: 'https://foreign.example' }, signal: AbortSignal.timeout(5000) })).status, 403);
    return { base, cookie, get, post };
  }
  const web = await connect();
  await run(['exec', '-T', 'learning-helper', 'mkdir', '-p', '/data/other-workspace']);
  const fixture = await browserSmoke({ web, harness, plugin, work, workspacePath: '/data/workspace', otherWorkspacePath: '/data/other-workspace', screenshotsPath: join(plugin, 'artifacts/docker-browser') });
  record.browser = 'PASS';
  const scope = `/learning-helper/v2/sessions/${fixture.sessionId}`;
  const before = await (await web.get(`${scope}/dashboard`)).json();
  const sources = await (await web.get(`${scope}/sources`)).json();
  await run(['restart']); await delay(1000); await run(['up', '-d', '--wait', '--wait-timeout', '120']);
  const restarted = await connect();
  assert.deepEqual(await (await restarted.get(`${scope}/dashboard`)).json(), before);
  assert.deepEqual(await (await restarted.get(`${scope}/sources`)).json(), sources);
  record.restartPersistence = 'PASS'; record.authAndOrigin = 'PASS'; record.status = 'passed';
  record.image = (await run(['images', '-q'])).trim();
} catch (error) {
  record.status = 'failed'; record.error = scrub(String(error)); process.exitCode = 1;
  if (created) record.logs = scrub(await run(['logs', '--tail', '80']).catch(() => 'container logs unavailable'));
}
finally {
  // This unique project and its new fixture volume are owned solely by this invocation.
  if (created) await run(['down', '--volumes', '--remove-orphans']).catch(e => { record.cleanupError = scrub(String(e)); process.exitCode = 1; });
  await writeFile(artifact, JSON.stringify(record, null, 2) + '\n'); await rm(work, { recursive: true, force: true });
}
console.log(`Docker acceptance: ${record.status}; artifacts/docker-result.json`);
