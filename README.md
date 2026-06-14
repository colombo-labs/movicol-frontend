# MoviCol Frontend

Frontend React + Vite para visualización y planificación de transporte público en Bogotá.

## Stack
- **React 18** + TypeScript
- **Vite** — bundler
- **HeroUI** (NextUI v2.4+) — componentes UI
- **Tailwind CSS** — estilos
- **Leaflet** — mapas interactivos
- **Lucide React** — iconos

## Estructura

```
src/
├── modules/
│   ├── rutas/          → Tab TM (20 troncales) + Tab SITP (689 rutas)
│   ├── planificar/     → Planificador de viaje con búsqueda de rutas reales
│   ├── accesibilidad/  → Panel de métricas de infraestructura
│   └── ...
├── shared/
│   ├── ui/             → AppModal, Header, componentes reutilizables
│   └── hooks/          → useTheme, etc.
└── public/
    └── data/           → GeoJSON reales (troncales, estaciones)
```

## Datos Reales
- `public/data/tm_troncales.geojson` — 20 troncales con geometría
- `public/data/tm_estaciones.geojson` — 332 estaciones TM

## Funcionalidades Implementadas
- ✅ Mapa interactivo con capas TM/SITP
- ✅ Planificador origen→destino con selección en mapa
- ✅ Búsqueda de rutas reales que conectan origen↔destino
- ✅ Cálculo local de distancia/tiempo cuando el backend no responde
- ✅ Modales de configuración y perfil
- ✅ Tarifa real $3,550 COP
- ✅ Sin datos mock/fake

## Desarrollo

```bash
npm install
npm run dev         # Dev server :3000
npm run build       # Build producción
npm run lint        # ESLint
npm run format      # Prettier
```

## Docker

```bash
docker build -t colombolabs/movicol-frontend:latest .
docker run -d --name movicol-frontend -p 3000:3000 colombolabs/movicol-frontend:latest
```

## Variables de entorno
- `VITE_API_URL` — URL del backend (default: `http://localhost:3001`)
