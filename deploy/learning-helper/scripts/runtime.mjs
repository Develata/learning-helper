import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, cp, mkdtemp, rename, readFile, writeFile, unlink, rm } from 'node:fs/promises';
import { createBridge } from './bridge.mjs';

process.umask(0o077);
const home = process.env.DSH_HOME;
if (home !== '/data') throw new Error('This image owns DSH_HOME=/data; mount the persistent volume there.');
await mkdir(`${home}/profiles`, { recursive: true });
await mkdir(`${home}/workspace`, { recursive: true });
const versions = JSON.parse(await readFile('/opt/learning-helper/versions.lock.json', 'utf8'));
const profileName = `learning-helper-${versions.learningHelperPluginSha.slice(0, 12)}`;
const profile = `${home}/profiles/${profileName}`;
let initialized = false;
try { initialized = (await readFile(`${profile}/.learning-helper-build`, 'utf8')) === versions.learningHelperPluginSha; }
catch (error) { if (error.code !== 'ENOENT') throw error; }
if (!initialized) {
  const pending = await mkdtemp(`${home}/profiles/.learning-helper-init-`);
  try {
    await cp('/opt/runtime/home/profiles/learning-helper', pending, { recursive: true, verbatimSymlinks: true });
    await writeFile(`${pending}/.learning-helper-build`, versions.learningHelperPluginSha);
    await rename(pending, profile); // Nonempty conflicting profiles fail; never overwrite user data.
  } finally { await rm(pending, { recursive: true, force: true }); }
}
const launchFile = '/tmp/learning-helper-launch.json';
try { await unlink(launchFile); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const bridge = createBridge(); await bridge.listen();
const child = spawn('node', ['/opt/runtime/node_modules/@deepseek-ai/dsh/lib/bin.js', '--profile', profileName, ...process.argv.slice(2), '--no-open', '--port', '3000'],
  { cwd: `${home}/workspace`, env: process.env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
let stopping = false; let ready = false; let startupFailed = false;
const stop = () => { if (stopping) return; stopping = true; try { process.kill(-child.pid, 'SIGTERM'); } catch (e) { if (e.code !== 'ESRCH') throw e; }
  setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch (e) { if (e.code !== 'ESRCH') throw e; } }, 15_000).unref(); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
const startup = setTimeout(() => { startupFailed = true; console.error('Harness startup exceeded 60 seconds'); stop(); }, 60_000);
// Line buffering prevents a split launch token from leaking into container logs.
for (const stream of [child.stdout, child.stderr]) {
  let pending = '';
  stream.on('data', chunk => {
    pending += chunk;
    if (pending.length > 65_536) { pending = ''; console.error('Oversized runtime log line omitted'); return; }
    let end;
    while ((end = pending.indexOf('\n')) >= 0) {
      const line = pending.slice(0, end); pending = pending.slice(end + 1);
      const entry = line.match(/http:\/\/127\.0\.0\.1:3000\/\?token=[^\s]+/)?.[0];
      if (entry && !ready) { ready = true; clearTimeout(startup); void writeFile(launchFile, JSON.stringify({ url: entry }), { mode: 0o600 }).catch(stop);
        console.log('Learning Helper ready. Run: docker compose exec learning-helper node /opt/learning-helper/open.mjs'); }
      console.log(line.replace(/([?&]token=)[^\s]+/g, '$1[REDACTED]'));
    }
  });
}
const [code] = await once(child, 'exit'); clearTimeout(startup); await bridge.close();
process.exitCode = startupFailed ? 1 : stopping ? 0 : code ?? 1;
