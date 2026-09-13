import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

/**
 * Change only the port of the official loopback launch URL for host-side login.
 * @param {string} launchUrl Container launch URL, including its temporary token.
 * @param {string} hostPort Host port shared with the Compose mapping.
 * @returns {string} Local browser URL; callers must not log or persist it implicitly.
 */
export function hostLaunchUrl(launchUrl, hostPort = '3010') {
  if (!/^[1-9][0-9]{0,4}$/.test(hostPort) || Number(hostPort) > 65535) {
    throw new Error('LEARNING_HELPER_PORT must be an integer from 1 to 65535.');
  }
  // Do not include a malformed input (which may contain a token) in diagnostics.
  let url;
  try { url = new URL(launchUrl); }
  catch { throw new Error('Invalid local launch URL.'); }
  if (url.origin !== 'http://127.0.0.1:3000' || url.username || url.password ||
      url.pathname !== '/' || url.hash || !url.searchParams.get('token')) {
    throw new Error('Invalid local launch URL.');
  }
  url.port = hostPort;
  return url.href;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Explicit operator action only; never save this URL in screenshots or reports.
  try {
    const { url } = JSON.parse(await readFile('/tmp/learning-helper-launch.json', 'utf8'));
    console.log(hostLaunchUrl(url, process.env.LEARNING_HELPER_PORT));
  } catch {
    console.error('Learning Helper: cannot open the login URL. Check container readiness and LEARNING_HELPER_PORT (1..65535).');
    process.exitCode = 1;
  }
}
