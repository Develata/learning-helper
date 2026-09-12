import { readFile } from 'node:fs/promises';
// Explicit local operator action; do not save this temporary authenticated URL in screenshots or reports.
const { url } = JSON.parse(await readFile('/tmp/learning-helper-launch.json', 'utf8'));
console.log(url);
