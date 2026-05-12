# 🗺️ MoviCol Frontend

Aplicación web de movilidad inteligente para Bogotá.

## Stack

- **React** 19 + **TypeScript** 5.5
- **Vite** 5 (bundler)
- **Hero UI** 2.4 (componentes UI)
- **Tailwind CSS** 3.4 (utilidades)
- **Leaflet** 1.9 + react-leaflet (mapas)
- **Socket.io-client** 4.7 (WebSocket real-time)
- **Zustand** 4.5 (state management)
- **Vitest** 1.6 (testing)

## Arquitectura

Modular por feature — estilo Agrotech mejorado.

```
src/
├── app/                         # Router + Layout principal
├── shared/                      # Reutilizable en TODOS los módulos
│   ├── ui/                      # Componentes UI globales (GlassCard, AppModal, Sidebar)
│   ├── hooks/                   # Hooks globales (useModal, useSocket)
│   ├── api/                     # HTTP client + WS client
│   ├── types/                   # Types globales
│   └── config/
└── modules/
    ├── mapa/                    # 🗺️ Mapa interactivo
    ├── predicciones/            # 🔮 Predicción de rutas
    ├── siniestralidad/          # 🚨 Zonas de riesgo
    ├── accesibilidad/           # ♿ Closeness centrality
    ├── metricas/                # 📊 Dashboard
    └── chat/                    # 🤖 Widget flotante IA
```

### Estructura de cada módulo

```
modules/{modulo}/
├── models/index.ts              # Types + Interfaces + Schemas + Mappers
├── components/
│   ├── ui/                      # Componentes pequeños (atómicos)
│   └── widgets/                 # Componentes grandes (compuestos)
├── features/                    # Bloques funcionales (integran hooks+api+widgets)
├── hooks/                       # Lógica de estado del módulo
├── api/                         # Llamadas al backend
└── pages/                       # Página del módulo (usa features)
```

## Quick Start

```bash
npm install --legacy-peer-deps
npm run dev     # http://localhost:3000
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Diseño

- **Glassmorphism** dark mode (backdrop-blur, bordes sutiles)
- **Sidebar** vertical con iconos (navegación por módulos)
- **Modals** para acciones rápidas dentro de cada módulo
- **Chat IA** como widget flotante abajo a la derecha
- **Responsive** (mobile-first)

## Requisitos

- Node.js 20+
- Backend corriendo en :3001
