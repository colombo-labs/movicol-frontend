# MoviCol Frontend

Aplicación de movilidad urbana inteligente para Bogotá — React + Vite + TypeScript + Leaflet.

## Stack

- React 18 + Vite 5 + TypeScript
- TailwindCSS + Leaflet (mapa)
- Lucide React (iconos)

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest (49 tests)
npm run build      # Production build
```

## Módulos

| Módulo | Descripción |
|--------|-------------|
| `planificar/` | Planificador de viaje multi-modal (TM, SITP, Vehículo) |
| `rutas/` | Explorer de rutas con filtros, cercanas (GPS), alertas |
| `accesibilidad/` | Panel de estadísticas de accesibilidad |
| `metricas/` | Métricas del sistema y congestión |
| `mapa/` | Componentes del mapa (layers, markers, search) |
| `predicciones/` | API client + hooks de predicción |

## Env

```env
VITE_API_URL=http://localhost:3001
```
