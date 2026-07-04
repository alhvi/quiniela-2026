import { writeFile, mkdir } from 'node:fs/promises';

const API_BASE = 'https://api.wc2026api.com';
const API_KEY = process.env.WC2026_API_KEY;

if (!API_KEY) {
  console.error('Missing WC2026_API_KEY env var');
  process.exit(1);
}

const res = await fetch(`${API_BASE}/matches`, {
  headers: { Authorization: `Bearer ${API_KEY}` },
});
if (!res.ok) {
  console.error(`API error: HTTP ${res.status}`);
  process.exit(1);
}
const data = await res.json();

await mkdir('data', { recursive: true });
await writeFile(
  'data/scores.json',
  JSON.stringify({ fetchedAt: new Date().toISOString(), data }, null, 2) + '\n'
);
console.log('data/scores.json updated');
