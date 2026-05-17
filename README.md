# Quiniela Mundial 2026 — Familión Juárez

Seguimiento de quinielas para la fase de grupos del Mundial 2026 (72 partidos, 11–27 jun).

## Archivo

| Archivo | Descripción |
|---|---|
| `quiniela.html` | Diseño mobile-first, tarjetas por partido, vista por fecha / por grupo |

## Participantes (en orden en el array PREDICTIONS)

| Índice | Nombre | Nombre en archivo |
|---|---|---|
| 0 | Juan | Juan A. |
| 1 | Alhvi | Alhvi |
| 2 | Martín | Martín A.Q. |
| 3 | Álvaro | Álvaro & Diana |
| 4 | Ricky | Ricky |
| 5 | Canche | Carlos Villagrán |
| 6 | Erick | Erick Cruz |

## Sistema de puntos

- **3 pts** — marcador exacto (ej. predijo 2-1, resultado 2-1)
- **1 pt** — resultado correcto (ej. predijo 2-1, resultado 3-0 → ambos ganó local)
- **0 pts** — fallo

## API de resultados en vivo

**Proveedor:** wc2026api.com  
**Base URL:** `https://api.wc2026api.com`  
**API Key:** `wc26_XkWhnmn6apUpGmpPYendFN`  
**Auth header:** `Authorization: Bearer wc26_XkWhnmn6apUpGmpPYendFN`

### Endpoints relevantes

```
GET /matches          → lista de todos los partidos con scores y status
GET /test/match       → partido ficticio Brasil vs Argentina que cicla por todas las fases en tiempo real (útil para dev antes del torneo)
```

### Estructura de respuesta esperada (a confirmar)

```json
[
  {
    "id": 1,
    "match_number": 1,
    "round": "group",
    "group_name": "A",
    "home_team": "Mexico",
    "away_team": "South Africa",
    "stadium": "...",
    "kickoff_utc": "2026-06-11T...",
    "status": "scheduled",
    "home_score": null,
    "away_score": null
  }
]
```

**Valores de `status` posibles:** `scheduled`, `in_progress` / `live`, `finished` / `completed` / `ft`  
**Nota:** Los campos exactos de goles pueden ser `home_score`/`away_score` o `score_home`/`score_away`. El código actual intenta ambos con `??`.

### Mapeo de nombres (inglés API → español app)

El objeto `EN_TO_ES` en `quiniela.html` cubre todos los equipos. Si la API usa un nombre no listado, aparecerá sin mapear (partido no se actualiza). Agregar al objeto si es necesario.

## Pendientes / Cosas por hacer

- [x] **API verificada** — responde correctamente, devuelve array directo, campos `home_score`/`away_score`
- [x] **Nombres de equipos corregidos** — `Korea Republic`, `Bosnia-Herzegovina`, `IR Iran` agregados al mapeo
- [ ] **Verificar status en vivo** — `scheduled` confirmado; `in_progress`/`finished` a confirmar cuando arranque el torneo (11 jun)
- [ ] **Subir a GitHub Pages** para que toda la familia pueda acceder con un URL compartido

## Deploy en GitHub Pages

1. Crear repo en GitHub (puede ser privado con Pages en plan gratuito solo si es público)
2. `git init && git add . && git commit -m "init"`
3. `git remote add origin https://github.com/TU_USUARIO/quiniela-2026.git`
4. `git push -u origin main`
5. En GitHub → Settings → Pages → Source: Deploy from branch → main → / (root)
6. Compartir la URL con la familia

## Notas técnicas

- Sin localStorage ni edición manual — todos los scores vienen de la API
- El app hace polling cada 60 segundos (`POLL_MS = 60000`)
- Las banderas usan `flagcdn.com/h40/{iso-code}.png` (no emoji, no funcionan en Windows)
- Para dev antes del torneo, cambiar la URL del fetch a `/test/match` y ajustar según la respuesta real del endpoint de prueba
