import { readFile } from 'node:fs/promises';
try {
  const { url } = JSON.parse(await readFile('/tmp/learning-helper-launch.json', 'utf8'));
  const signal = AbortSignal.timeout(7000);
  const response = await fetch(url, { redirect: 'manual', signal });
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (response.status !== 303 || !cookie) throw new Error('auth');
  const health = await fetch('http://127.0.0.1:3000/learning-helper/v1/health', { headers: { cookie }, signal });
  if (health.status !== 200) throw new Error('health');
} catch { process.exitCode = 1; }
