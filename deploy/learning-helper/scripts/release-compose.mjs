import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function pinCompose(content, digest) {
  assert.equal(digest, digest.trim());
  assert.match(digest, /^ghcr\.io\/develata\/learning-helper@sha256:[a-f0-9]{64}$/);
  const placeholder = /\$\{LEARNING_HELPER_IMAGE:-[^}]+\}/g;
  assert.equal([...content.matchAll(placeholder)].length, 1, 'Expected one release image');
  return content.replace(placeholder, digest);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const content = await readFile(new URL('../compose.release.yml', import.meta.url), 'utf8');
  await writeFile(process.argv[3], pinCompose(content, process.argv[2]));
}
