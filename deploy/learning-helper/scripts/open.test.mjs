import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { hostLaunchUrl } from './open.mjs';

// Synthetic token only; no live launch URL is used in tests or failure output.
const launch = 'http://127.0.0.1:3000/?token=fixture%2Bvalue%2F%3D';

test('default host URL uses 3010 and preserves the official token', () => {
  assert.equal(hostLaunchUrl(launch), 'http://127.0.0.1:3010/?token=fixture%2Bvalue%2F%3D');
});

test('configured host ports preserve loopback, path and query without changing the input', () => {
  for (const port of ['1', '80', '3000', '33333', '65535']) {
    const mapped = new URL(hostLaunchUrl(launch, port));
    assert.equal(mapped.hostname, '127.0.0.1');
    assert.equal(mapped.port || '80', port);
    assert.equal(mapped.pathname, '/');
    assert.equal(mapped.search, new URL(launch).search);
  }
  assert.equal(new URL(launch).port, '3000');
});

test('invalid and automatic ports fail instead of producing a misleading login URL', () => {
  for (const port of ['', '0', '03010', '-1', '65536', '1.2', '3e3', ' 3010', '3010\n', '3010:3001', 'bad']) {
    assert.throws(() => hostLaunchUrl(launch, port), /LEARNING_HELPER_PORT/);
  }
});

test('only an authenticated internal loopback URL can be mapped; errors omit its contents', () => {
  for (const value of [undefined, 'bad?token=fixture-secret', 'https://127.0.0.1:3000/?token=fixture-secret',
    'http://example.org:3000/?token=fixture-secret', 'http://127.0.0.1:3001/?token=fixture-secret',
    'http://user@127.0.0.1:3000/?token=fixture-secret', 'http://127.0.0.1:3000/else?token=fixture-secret',
    'http://127.0.0.1:3000/?token=', 'http://127.0.0.1:3000/?token=fixture-secret#extra']) {
    assert.throws(() => hostLaunchUrl(value), { message: 'Invalid local launch URL.' });
  }
});

test('Compose gives open.mjs the same default or custom host port it publishes', () => {
  const deployment = resolve(import.meta.dirname, '..');
  for (const port of [undefined, '', '33334']) {
    const env = { ...process.env };
    delete env.LEARNING_HELPER_PORT;
    if (port !== undefined) env.LEARNING_HELPER_PORT = port;
    const result = spawnSync(process.env.DOCKER_BIN ?? 'docker', ['compose', '--env-file', '/dev/null',
      '-f', resolve(deployment, 'compose.yml'), 'config', '--format', 'json'],
    { env, encoding: 'utf8', timeout: 10_000, maxBuffer: 1_048_576 });
    assert.equal(result.status, 0, 'Docker Compose config must succeed (Docker CLI required).');
    const service = JSON.parse(result.stdout).services['learning-helper'];
    assert.equal(service.ports.length, 1);
    const mapping = service.ports[0];
    assert.equal(mapping.host_ip, '127.0.0.1');
    assert.equal(mapping.target, 3001);
    assert.equal(String(mapping.published), port || '3010');
    const url = new URL(hostLaunchUrl(launch, service.environment.LEARNING_HELPER_PORT));
    assert.equal(url.port, String(mapping.published));
  }
});
