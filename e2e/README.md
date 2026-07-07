# E2E Tests — MoviCol Frontend

Tests end-to-end con Playwright. Simulan usuario real interactuando con la app.

## Requisitos

- Node.js 18+
- Chromium instalado: `npx playwright install chromium`
- App corriendo en `http://localhost:3000` (o se levanta sola via config)

## Correr

```bash
npm run test:e2e            # Headless (CI)
npm run test:e2e:headed     # Ver el browser
npm run test:e2e:ui         # Playwright UI (debug)
npm run test:e2e:report     # Ver último reporte
```

## Estructura

```
e2e/
├── pages/              → Page Object Model (encapsula selectores)
│   ├── MapPage.ts      → Layout principal, mapa, paneles
│   ├── ChatPage.ts     → Widget de chat
│   └── PlanificarPage.ts → Panel planificar viaje
├── specs/              → Specs de test por feature
│   ├── auth.spec.ts    → Login, avatar, configuración
│   ├── chat.spec.ts    → Chat con MoviBot
│   ├── navigation.spec.ts → Paneles, layout, navegación
│   └── planificar.spec.ts → Planificar viaje
├── fixtures/           → Data mock para tests
├── results/            → Screenshots/videos on failure
└── report/             → Reporte HTML
```

## Convenciones

- **Page Object Model**: nunca usar selectores directamente en specs
- **Independencia**: cada test no depende de otro
- **Resiliencia**: usar `getByRole`, `getByText` sobre selectores CSS
- **Mobile**: todos los tests corren en Chrome + iPhone 14
- **Failures**: screenshot + video automático
