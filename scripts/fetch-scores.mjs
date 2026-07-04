import { writeFile, mkdir, readFile } from 'node:fs/promises';

const API_BASE = 'https://api.wc2026api.com';
const API_KEY = process.env.WC2026_API_KEY;

// Guatemala = UTC-6 fijo (sin horario de verano)
const GT_TO_UTC_MS = 6 * 60 * 60 * 1000;
const WINDOW_BEFORE_MS = 30 * 60 * 1000;   // 30 min antes del kickoff
const WINDOW_AFTER_MS = 3 * 60 * 60 * 1000; // 3 horas después (tiempo extra/penales/reporte)

function isMatchWindowActive(schedule, nowMs) {
  return schedule.some(({ date, time }) => {
    const [h, m] = time.split(':').map(Number);
    // date/time están en hora de Guatemala; se convierten al instante UTC real
    const kickoffUtcMs = Date.parse(`${date}T00:00:00.000Z`) + h * 3600000 + m * 60000 + GT_TO_UTC_MS;
    return nowMs >= kickoffUtcMs - WINDOW_BEFORE_MS && nowMs <= kickoffUtcMs + WINDOW_AFTER_MS;
  });
}

const scheduleUrl = new URL('./match-schedule.json', import.meta.url);
const schedule = JSON.parse(await readFile(scheduleUrl, 'utf8'));

if (!isMatchWindowActive(schedule, Date.now())) {
  console.log('Fuera de horario de partidos, no se llama al API.');
  process.exit(0);
}

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
