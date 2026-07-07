# Quiniela Mundial 2026 — Familión Juárez

Seguimiento de quinielas para la fase de grupos del Mundial 2026 (72 partidos, 11–27 jun).

**Live:** https://alhvi.github.io/quiniela-2026/

## Archivo

| Archivo | Descripción |
|---|---|
| `index.html` | App mobile-first, tarjetas por partido, vista por fecha / por grupo |

## Participantes (en orden en el array PREDICTIONS)

| Índice | Nombre |
|---|---|
| 0 | Juan |
| 1 | Alhvi |
| 2 | Martín |
| 3 | Álvaro & Diana |
| 4 | Ricky |
| 5 | Canche |
| 6 | Erick |
| 7 | Claude |

## Sistema de puntos

- **3 pts** — marcador exacto (ej. predijo 2-1, resultado 2-1)
- **1 pt** — resultado correcto (ej. predijo 2-1, resultado 3-0 → ambos ganó local)
- **0 pts** — fallo

## API de resultados en vivo

**Proveedor:** football-data.org (plan free, gratis para siempre)  
**Base URL:** `https://api.football-data.org/v4`  
**Auth header:** `X-Auth-Token: <FOOTBALL_DATA_API_KEY>`  
**Key:** guardada como secret de GitHub Actions (`FOOTBALL_DATA_API_KEY`), nunca en el código fuente.  
**Límite:** 10 llamadas/minuto (mucho más holgado que el proveedor anterior, que tenía 100/día y se agotó — ver historial de commits).

> Proveedor anterior (`wc2026api.com`) descontinuado el 2026-07-07: la key de prueba se desactivó al superar su cuota de 100 llamadas/día, causada por correr el cron nativo de GitHub y el cron externo en paralelo.

### Endpoint

```
GET /competitions/WC/matches   → todos los partidos del Mundial con scores y status
```

`scripts/fetch-scores.mjs` normaliza la respuesta anidada de football-data.org (`homeTeam.name`, `score.fullTime.{home,away}`, `score.winner` como `HOME_TEAM`/`AWAY_TEAM`/`DRAW`, etc.) al mismo shape plano que ya consumía `applyScores()` en `index.html` (`home_team`, `away_team`, `home_score`, `away_score`, `home_pen`, `away_pen`, `status`, `winner` como nombre de equipo), así el front-end no tuvo que cambiar.

**Valores de `status` de football-data.org:** `SCHEDULED`, `TIMED`, `IN_PLAY`, `PAUSED`, `FINISHED`, `SUSPENDED`, `POSTPONED`, `CANCELLED`, `AWARDED` (el front-end los usa en minúsculas).

**Nota sobre penales:** cuando `score.duration` es `PENALTY_SHOOTOUT`, el campo `score.fullTime` de football-data.org ya viene con los goles de penales sumados (`regularTime + extraTime + penalties`). `fetch-scores.mjs` resta `score.penalties` de `fullTime` antes de guardar `home_score`/`away_score`, para no duplicar los penales al sumarlos de nuevo en `applyScores()`.

### Mapeo de nombres (inglés API → español)

El objeto `EN_TO_ES` en `index.html` cubre los 32 equipos del bracket (los definidos en `MATCHDEF`), verificados contra una respuesta real de football-data.org el 2026-07-07. Único alias que football-data.org usa distinto al proveedor anterior: `Cape Verde Islands` (campo `name`) en vez de `Cape Verde`, ya agregado al mapeo.

## Notas técnicas

- Los resultados se obtienen por un GitHub Action programado (`.github/workflows/fetch-scores.yml`) que corre cada 5 min durante julio, pero el script (`scripts/fetch-scores.mjs`) solo llama al API real si el horario actual cae dentro de la ventana de algún partido (según `scripts/match-schedule.json`, ±30min/3h por kickoff). Fuera de esas ventanas no gasta llamadas. El resultado se guarda en `data/scores.json` (commit automático) y el front-end solo lee ese JSON estático — nunca llama al API externo directamente, así el consumo no depende de cuánta gente visite la página.
- Horarios en tiempo de Guatemala (UTC-6), hardcodeados desde la API
- Partidos ordenados por hora dentro de cada fecha
- Banderas vía `flagcdn.com/h40/{iso-code}.png`
- `.claude/` y `*.stackdump` excluidos del repo via `.gitignore`
