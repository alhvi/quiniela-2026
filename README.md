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

**Proveedor:** wc2026api.com  
**Base URL:** `https://api.wc2026api.com`  
**API Key:** `wc26_XkWhnmn6apUpGmpPYendFN`  
**Auth header:** `Authorization: Bearer wc26_XkWhnmn6apUpGmpPYendFN`

### Endpoints

```
GET /matches      → lista de todos los partidos con scores y status
GET /test/match   → partido ficticio para dev (cicla por todas las fases en tiempo real)
```

### Estructura de respuesta confirmada

```json
[
  {
    "match_number": 1,
    "round": "group",
    "group_name": "A",
    "home_team": "Mexico",
    "away_team": "South Africa",
    "kickoff_utc": "2026-06-11T19:00:00Z",
    "status": "scheduled",
    "home_score": null,
    "away_score": null
  }
]
```

**Valores de `status` confirmados:** `scheduled` · pendiente confirmar `in_progress` / `finished` en vivo (11 jun)

### Mapeo de nombres (inglés API → español)

El objeto `EN_TO_ES` en `index.html` cubre todos los equipos verificados contra la API. Nombres no estándar ya mapeados: `Korea Republic`, `Bosnia-Herzegovina`, `IR Iran`.

## Notas técnicas

- Fetch al cargar la página (sin polling automático), caché localStorage 5 min
- Horarios en tiempo de Guatemala (UTC-6), hardcodeados desde la API
- Partidos ordenados por hora dentro de cada fecha
- Banderas vía `flagcdn.com/h40/{iso-code}.png`
- `.claude/` y `*.stackdump` excluidos del repo via `.gitignore`
