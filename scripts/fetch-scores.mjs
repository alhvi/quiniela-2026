import { writeFile, mkdir, readFile } from 'node:fs/promises';

const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

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
  console.error('Missing FOOTBALL_DATA_API_KEY env var');
  process.exit(1);
}

const res = await fetch(`${API_BASE}/competitions/WC/matches`, {
  headers: { 'X-Auth-Token': API_KEY },
});
if (!res.ok) {
  console.error(`API error: HTTP ${res.status}`);
  process.exit(1);
}
const json = await res.json();

// Normaliza al mismo shape plano que ya consume applyScores() en index.html,
// así no hace falta tocar el front-end al cambiar de proveedor de API.
const data = (json.matches || []).map(m => {
  const home = m.homeTeam?.name ?? null;
  const away = m.awayTeam?.name ?? null;
  const sc = m.score || {};
  const ft = sc.fullTime || {};
  const pen = sc.penalties || {};
  const winnerKey = sc.winner; // 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  const winner = winnerKey === 'HOME_TEAM' ? home : winnerKey === 'AWAY_TEAM' ? away : null;
  // Cuando hubo penales, fullTime ya trae los goles de penales sumados
  // (regularTime + extraTime + penalties). Restamos los penales para que
  // home_score/away_score sean el resultado sin penales, igual que espera
  // applyScores() en index.html (que los vuelve a sumar con home_pen/away_pen).
  const homeScore = (pen.home != null && ft.home != null) ? ft.home - pen.home : ft.home;
  const awayScore = (pen.away != null && ft.away != null) ? ft.away - pen.away : ft.away;
  return {
    home_team: home,
    away_team: away,
    home_score: homeScore,
    away_score: awayScore,
    home_pen: pen.home ?? null,
    away_pen: pen.away ?? null,
    status: m.status,
    winner,
  };
});

await mkdir('data', { recursive: true });
await writeFile(
  'data/scores.json',
  JSON.stringify({ fetchedAt: new Date().toISOString(), data }, null, 2) + '\n'
);
console.log('data/scores.json updated');
