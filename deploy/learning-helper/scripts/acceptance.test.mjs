import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

test('existing-image acceptance never builds/pulls and cleans its own failed cold boot', async t => {
  const root = await mkdtemp(join(tmpdir(), 'lh-release-acceptance-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const plugin = join(root, 'plugin'); await mkdir(join(plugin, 'scripts'), { recursive: true });
  await writeFile(join(plugin, 'scripts/browser-smoke.mjs'), 'export function browserSmoke() { throw new Error("must not reach browser after failed boot"); }');
  const fake = join(root, 'docker.mjs'); const calls = join(root, 'calls.jsonl');
  await writeFile(fake, `#!/usr/bin/env node
import { appendFileSync, readFileSync } from 'node:fs';
const args = process.argv.slice(2);
const compose = args[args.lastIndexOf('-f') + 1];
appendFileSync(${JSON.stringify(calls)}, JSON.stringify({ args, compose: readFileSync(compose, 'utf8') }) + '\\n');
if (args.includes('up')) { console.error('fixture cold boot failed'); process.exitCode = 1; }
`, { mode: 0o700 });
  const run = promisify(execFile);
  await assert.rejects(run(process.execPath, [new URL('./acceptance.mjs', import.meta.url).pathname, plugin], {
    env: { ...process.env, DOCKER_BIN: fake, LH_DOCKER_TEST_IMAGE: 'learning-helper:fixture' },
    timeout: 15_000,
  }), e => e.code === 1 && !e.killed && e.signal === null);
  const records = (await readFile(calls, 'utf8')).trim().split('\n').map(line => JSON.parse(line));
  assert.ok(records.length >= 3);
  assert.ok(records.every(r => !r.args.includes('build') && !r.args.includes('pull')));
  assert.match(records[0].compose, /image: learning-helper:fixture/);
  assert.match(records[0].compose, /pull_policy: never/);
  assert.ok(records[0].args.some(a => a.endsWith('compose.release.yml')));
  assert.ok(records.at(-1).args.includes('down'));
  assert.ok(records.at(-1).args.includes('--volumes'));
  assert.match(records[0].args[2], /^lh-acceptance-learning-helper-docker-/);
  await assert.rejects(access(records[0].args[records[0].args.lastIndexOf('-f') + 1]), { code: 'ENOENT' });
  const receipt = JSON.parse(await readFile(join(plugin, 'artifacts/docker-result.json'), 'utf8'));
  assert.equal(receipt.status, 'failed'); assert.equal(receipt.build, 'EXTERNAL'); assert.equal(receipt.noCache, false);
});
