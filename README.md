![CI](https://github.com/colombo-labs/movicol-frontend/actions/workflows/ci.yml/badge.svg)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=colombo-labs_movicol-frontend&metric=alert_status)](https://sonarcloud.io/dashboard?id=colombo-labs_movicol-frontend)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=colombo-labs_movicol-frontend&metric=bugs)](https://sonarcloud.io/dashboard?id=colombo-labs_movicol-frontend)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=colombo-labs_movicol-frontend&metric=code_smells)](https://sonarcloud.io/dashboard?id=colombo-labs_movicol-frontend)

# MoviCol Frontend

React + Vite frontend for Bogotá's public transport visualization and trip planning.

## Stack
- React 18 + TypeScript + Vite
- HeroUI (NextUI v2.4+) + Tailwind CSS
- Leaflet (interactive maps)
- Lucide React (icons)

## Features (v0.2.0)
- ✅ Interactive map with TM/SITP layers
- ✅ 20 real TransMilenio trunk routes (GeoJSON)
- ✅ 332 real TM stations
- ✅ 689 real SITP routes (42,601 stops)
- ✅ Trip planner with real route matching (origin↔destination)
- ✅ Accessibility metrics from real data
- ✅ Config/Profile modals (fixed z-index over map)
- ✅ Real fare: COP $3,550
- ✅ Zero mock data

## Run
```bash
npm install && npm run dev     # Dev :3000
npm run build                  # Production build
npm run lint                   # ESLint
npm run format                 # Prettier
```

## Docker
```bash
docker build -t colombolabs/movicol-frontend:latest .
docker run -d -p 3000:3000 colombolabs/movicol-frontend:latest
```

## Env
- `VITE_API_URL` — Backend URL (default: `http://localhost:3001`)
