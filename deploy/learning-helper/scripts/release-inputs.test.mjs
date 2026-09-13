import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateReleaseInputs } from './release-inputs.mjs';
import { pinCompose } from './release-compose.mjs';

const lock = JSON.parse(await readFile(new URL('../versions.lock.json', import.meta.url), 'utf8'));
const dockerfile = await readFile(new URL('../Dockerfile', import.meta.url), 'utf8');
test('release input gate rejects mutable versions, wrong platforms, and image lock drift', () => {
  assert.equal(validateReleaseInputs('v0.2.0', lock, dockerfile).version, '0.2.0');
  for (const tag of ['main','v0.2.0\n','v0.2.0;false','v00.2.0']) assert.throws(() => validateReleaseInputs(tag, lock, dockerfile));
  for (const patch of [{learningHelperPluginSha:'main'}, {platform:'linux/arm64'}, {nodeVersion:'latest'}, {runtimeImage:'node:latest'}]) {
    assert.throws(() => validateReleaseInputs('v0.2.0', {...lock,...patch}, dockerfile));
  }
  assert.throws(() => validateReleaseInputs('v0.2.0', lock, dockerfile.replace(lock.runtimeImage, lock.buildImage)));
});

test('downloadable Compose pins one immutable image without changing runtime security or volume', async () => {
  const compose = await readFile(new URL('../compose.release.yml', import.meta.url), 'utf8');
  const digest = 'ghcr.io/develata/learning-helper@sha256:' + 'a'.repeat(64);
  const pinned = pinCompose(compose, digest);
  assert.ok(pinned.includes(digest));
  assert.equal(pinned.replace(digest, '${LEARNING_HELPER_IMAGE:-ghcr.io/develata/learning-helper:0.2.0}'), compose);
  assert.doesNotMatch(pinned, /^\s+build:/m);
  for (const value of ['ghcr.io/develata/learning-helper:latest', digest + '\n', 'attacker/image@sha256:' + 'a'.repeat(64)]) assert.throws(() => pinCompose(compose, value));
  assert.throws(() => pinCompose(compose + compose, digest));
});
