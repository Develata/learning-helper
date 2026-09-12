import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, symlinkSync, existsSync, realpathSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';

// A copied profile must not depend on the build directory's Node package ancestors.
const modules = '/opt/runtime/home/profiles/learning-helper/node_modules';
const peers = JSON.parse(readFileSync(`${modules}/dsh-learning-helper/package.json`)).peerDependencies;
const copied = new Map();
function packageDirectory(anchor, name) {
  for (let current = anchor; ; current = dirname(current)) {
    const candidate = join(current, 'node_modules', name);
    if (existsSync(join(candidate, 'package.json'))) return realpathSync(candidate);
    if (dirname(current) === current) throw new Error(`Missing locked peer dependency: ${name}`);
  }
}
function copyLockedPackage(anchor, name) {
  const source = packageDirectory(anchor, name);
  const pkg = JSON.parse(readFileSync(join(source, 'package.json')));
  const target = `/opt/runtime/learning-peers/node_modules/${name}`;
  if (copied.has(name)) { assert.equal(copied.get(name), pkg.version); return target; }
  assert.ok(copied.size < 32, 'Unexpectedly large private peer closure');
  copied.set(name, pkg.version); mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
  for (const dep of Object.keys(pkg.dependencies ?? {})) copyLockedPackage(source, dep);
  return target;
}
for (const [name, version] of Object.entries(peers)) {
  let target = `/opt/runtime/node_modules/${name}`;
  const actual = existsSync(`${target}/package.json`) ? JSON.parse(readFileSync(`${target}/package.json`)).version : undefined;
  if (actual !== version) {
    // Harness vendors 3.18.2; the plugin's lockfile owns its exact 3.18.1 schema builder.
    // Preserve that declared dependency rather than silently substituting a different peer.
    assert.ok((name === '@deepseek-ai/schemastery' && version === '3.18.1' && actual === '3.18.2')
      || (name === 'react' && version === '18.3.1' && actual === undefined), `Unexpected peer difference: ${name}`);
    target = copyLockedPackage('/build/plugin', name);
    assert.equal(JSON.parse(readFileSync(`${target}/package.json`)).version, version);
  }
  const link = `${modules}/${name}`;
  assert.ok(!existsSync(link), `Unexpected profile-owned peer: ${name}`);
  mkdirSync(dirname(link), { recursive: true }); symlinkSync(target, link, 'dir');
}
