import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, globSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative, dirname } from 'node:path';

const lock = JSON.parse(readFileSync('/build/versions.lock.json', 'utf8'));
function run(command, args, cwd, timeout = 600_000, extraEnv = {}) {
  const r = spawnSync(command, args, { cwd, env: { ...process.env, ...extraEnv }, stdio: 'inherit', timeout, killSignal: 'SIGKILL' });
  if (r.error || r.status !== 0) throw new Error(`build step failed: ${command} ${args[0]} (${r.error?.code ?? r.status})`);
}
function checkout(repo, sha, destination) {
  assert.match(sha, /^[a-f0-9]{40}$/); mkdirSync(destination);
  run('git', ['init', '-q'], destination);
  run('git', ['remote', 'add', 'origin', `https://github.com/Develata/${repo}.git`], destination);
  run('git', ['fetch', '--depth=1', 'origin', sha], destination, 120_000);
  run('git', ['checkout', '--detach', sha], destination);
}
assert.equal(process.versions.node, lock.nodeVersion);
assert.equal(spawnSync('pnpm', ['--version'], { encoding: 'utf8' }).stdout.trim(), lock.pnpmVersion);
checkout('learning-helper', lock.harnessForkSha, '/build/harness');
checkout('dsh-learning-helper', lock.learningHelperPluginSha, '/build/plugin');
assert.equal(JSON.parse(readFileSync('/build/harness/apps/cli/package.json')).version, lock.harnessVersion);
run('git', ['fetch', '--depth=1', 'origin', lock.harnessUpstreamSha], '/build/harness', 120_000);
const changes = spawnSync('git', ['diff', '--name-only', lock.harnessUpstreamSha, 'HEAD', '--', 'packages', 'apps'], { cwd: '/build/harness', encoding: 'utf8' });
assert.equal(changes.status, 0); assert.equal(changes.stdout, '', 'Harness runtime patch gate');
run('pnpm', ['install', '--frozen-lockfile'], '/build/harness');
run('pnpm', ['run', 'build'], '/build/harness', 1_200_000);
// Use the upstream runtime closure, which includes the peer providers omitted by the CLI-only closure.
// Same reviewed upstream postinstall, now at pnpm deploy's absolute file identity. No blanket script permission.
const require = createRequire('/build/harness/package.json'); const yaml = require('js-yaml');
const workspaceFile = '/build/harness/pnpm-workspace.yaml';
const workspace = yaml.load(readFileSync(workspaceFile, 'utf8'));
workspace.allowBuilds['@deepseek-ai/dsh-subprocess-local@file:///build/harness/packages/subprocess/subprocess-local'] = true;
writeFileSync(workspaceFile, yaml.dump(workspace));
// Linked workspaces satisfy peers in the development tree; a portable runtime must carry them explicitly.
// This deployment-only manifest overlay includes declared peers, never private implementation imports.
const packages = new Map(globSync(workspace.packages.map(p => `${p}/package.json`), { cwd: '/build/harness' })
  .map(path => { const p = JSON.parse(readFileSync(`/build/harness/${path}`)); return [p.name, { ...p, directory: dirname(path) }]; }));
const runtimeManifest = '/build/harness/python/sdk-runtime/package.json';
const runtime = JSON.parse(readFileSync(runtimeManifest));
const pluginPeers = JSON.parse(readFileSync('/build/plugin/package.json')).peerDependencies;
const queue = [...Object.keys(runtime.dependencies), ...Object.keys(pluginPeers)]; const visited = new Set();
for (const dep of Object.keys(pluginPeers)) if (packages.has(dep)) runtime.dependencies[dep] = 'workspace:^';
while (queue.length) {
  const name = queue.pop(); if (visited.has(name)) continue; visited.add(name);
  const p = packages.get(name); if (!p) continue;
  for (const peer of Object.keys(p.peerDependencies ?? {})) {
    if (packages.has(peer) && !p.peerDependenciesMeta?.[peer]?.optional) { runtime.dependencies[peer] = 'workspace:^'; queue.push(peer); }
  }
  queue.push(...Object.keys(p.dependencies ?? {}), ...Object.keys(p.optionalDependencies ?? {}));
}
writeFileSync(runtimeManifest, JSON.stringify(runtime, null, 2) + '\n');
const originalLock = yaml.load(readFileSync('/build/harness/pnpm-lock.yaml', 'utf8'));
// Only add workspace link records. Do not re-resolve external semver ranges or require registry metadata.
const importer = originalLock.importers['python/sdk-runtime'];
for (const [name, specifier] of Object.entries(runtime.dependencies)) {
  const p = packages.get(name); if (!p) continue;
  importer.dependencies[name] = { specifier, version: `link:${relative('python/sdk-runtime', p.directory)}` };
}
writeFileSync('/build/harness/pnpm-lock.yaml', yaml.dump(originalLock, { lineWidth: -1 }));
const deployedLock = yaml.load(readFileSync('/build/harness/pnpm-lock.yaml', 'utf8'));
assert.deepEqual(deployedLock.packages, originalLock.packages, 'Deployment must not change any locked external package or integrity');
run('pnpm', ['--filter', 'dsh-python-runtime-closure', '--config.injectWorkspacePackages=true', '--prod', 'deploy', '/opt/runtime'], '/build/harness');
run('pnpm', ['install', '--frozen-lockfile'], '/build/plugin');
run('pnpm', ['run', 'typecheck'], '/build/plugin'); run('pnpm', ['run', 'build'], '/build/plugin');
run('pnpm', ['pack', '--pack-destination', '/opt/runtime/packages'], '/build/plugin');
const cli = '/opt/runtime/node_modules/@deepseek-ai/dsh/lib/bin.js';
const env = { DSH_HOME: '/opt/runtime/home', npm_config_auto_install_peers: 'false' };
run('node', [cli, '--profile', 'learning-helper', '--from-default-profile', 'web', '--dump-config'], '/opt/runtime', 120_000, env);
const manifest = '/opt/runtime/home/profiles/learning-helper/package.json';
const profile = JSON.parse(readFileSync(manifest)); profile.packageManager = `pnpm@${lock.pnpmVersion}`;
writeFileSync(manifest, JSON.stringify(profile, null, 2) + '\n');
run('node', [cli, 'plugin', '--profile', 'learning-helper', 'add', '/opt/runtime/packages/dsh-learning-helper-0.1.0.tgz', '--ignore-scripts'], '/opt/runtime', 120_000, env);
// dsh owns and heals the official module fallback into the pinned runtime closure.
run('node', [cli, '--profile', 'learning-helper', '--dump-config'], '/opt/runtime', 120_000, env);
