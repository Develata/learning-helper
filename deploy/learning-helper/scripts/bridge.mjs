import net from 'node:net';

/** Byte-preserving bridge. Harness alone owns HTTP Host/Origin/auth and WebSocket handling. */
export function createBridge({ port = 3001, targetPort = 3000, host = '0.0.0.0', maxConnections = 256 } = {}) {
  const sockets = new Set();
  const server = net.createServer(client => {
    if (sockets.size >= maxConnections * 2) { client.destroy(); return; }
    const upstream = net.connect({ host: '127.0.0.1', port: targetPort });
    sockets.add(client); sockets.add(upstream);
    const connecting = setTimeout(() => upstream.destroy(), 5000);
    const destroy = () => { clearTimeout(connecting); client.destroy(); upstream.destroy(); sockets.delete(client); sockets.delete(upstream); };
    for (const socket of [client, upstream]) { socket.setTimeout(120_000, destroy); socket.on('error', destroy); socket.on('close', destroy); }
    upstream.once('connect', () => { clearTimeout(connecting); client.pipe(upstream); upstream.pipe(client); });
  });
  return { server, listen: () => new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); }),
    close: () => new Promise(resolve => { for (const socket of sockets) socket.destroy(); server.close(resolve); }) };
}
