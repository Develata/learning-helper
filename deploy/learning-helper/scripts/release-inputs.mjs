import assert from 'node:assert/strict';
import { readFile, appendFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function validateReleaseInputs(tag, lock, dockerfile) {
  assert.equal(tag, tag.trim());
  assert.match(tag, /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:alpha|beta|rc)\.[1-9]\d*)?$/);
  for (const key of ['harnessUpstreamSha', 'harnessForkSha', 'learningHelperPluginSha']) assert.match(lock[key], /^[a-f0-9]{40}$/);
  for (const key of ['nodeVersion', 'pnpmVersion']) assert.match(lock[key], /^\d+\.\d+\.\d+$/);
  for (const key of ['buildImage', 'runtimeImage']) assert.match(lock[key], /^node:[\w.-]+@sha256:[a-f0-9]{64}$/);
  assert.deepEqual([...dockerfile.matchAll(/^FROM (\S+)/gm)].map(m => m[1]), [lock.buildImage, lock.runtimeImage]);
  assert.equal(lock.platform, 'linux/amd64');
  return { version: tag.slice(1), plugin: lock.learningHelperPluginSha, node: lock.nodeVersion, pnpm: lock.pnpmVersion };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tag = process.argv[2];
  const lock = JSON.parse(await readFile(new URL('../versions.lock.json', import.meta.url), 'utf8'));
  const inputs = validateReleaseInputs(tag, lock, await readFile(new URL('../Dockerfile', import.meta.url), 'utf8'));
  const api = path => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', timeout: 30_000, maxBuffer: 1_048_576 }));
  const repo = 'Develata/dsh-learning-helper';
  let ref = api(`repos/${repo}/git/ref/tags/${tag}`).object;
  if (ref.type === 'tag') ref = api(`repos/${repo}/git/tags/${ref.sha}`).object;
  assert.equal(ref.type, 'commit');
  assert.equal(ref.sha, lock.learningHelperPluginSha, 'The plugin tag must resolve to the exact locked SHA');
  const release = api(`repos/${repo}/releases/tags/${tag}`);
  assert.equal(release.draft, false, 'Publish the plugin release first');
  const asset = `dsh-learning-helper-${inputs.version}.tgz`;
  assert.ok(release.assets.some(a => a.name === asset));
  assert.ok(release.assets.some(a => a.name === 'SHA256SUMS'));
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, Object.entries(inputs).map(([k,v]) => `${k}=${v}\n`).join(''));
  console.log(JSON.stringify(inputs));
}
