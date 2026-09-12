import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createBridge } from './bridge.mjs';

test('bridge preserves Host, Origin and cookie bytes; upstream failure closes the connection', async t => {
  const host = http.createServer((req, res) => res.end(JSON.stringify({ host: req.headers.host, origin: req.headers.origin, cookie: req.headers.cookie })));
  host.listen(0, '127.0.0.1'); await once(host, 'listening');
  const bridge = createBridge({ port: 0, host: '127.0.0.1', targetPort: host.address().port }); await bridge.listen();
  t.after(async () => { await bridge.close(); host.closeAllConnections(); await new Promise(r => host.close(r)); });
  // Fetch normalizes Host; use the HTTP client so the test actually sends this authority.
  const received = await new Promise((resolve, reject) => {
    const request = http.get({ host: '127.0.0.1', port: bridge.server.address().port,
      headers: { host: 'localhost:3000', origin: 'http://localhost:3000', cookie: 'fixture=test' }, signal: AbortSignal.timeout(3000) }, res => {
      let text = ''; res.on('data', b => { text += b; }); res.on('end', () => resolve(JSON.parse(text)));
    }); request.on('error', reject);
  });
  assert.deepEqual(received, { host: 'localhost:3000', origin: 'http://localhost:3000', cookie: 'fixture=test' });
  host.closeAllConnections(); await new Promise(r => host.close(r));
  await assert.rejects(fetch(`http://127.0.0.1:${bridge.server.address().port}`, { signal: AbortSignal.timeout(3000) }));
});
