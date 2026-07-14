# Tests — MoviCol Frontend

## Estructura

```text
tests/              → Tests unitarios (Vitest)
├── auth/           → useAuth, AuthButton
├── chat/           → useChatWs, useVoice, ChatMessage
├── config/         → ConfigModal
├── mapa/           → useStationSearch
├── notifications/  → NotificationsDropdown
├── planificar/     → TripPointsList, useRoutePredictMulti
├── predicciones/   → useRoutePredict
├── rutas/          → NearbyRoutes
├── shared/         → geocode, reverseGeocode, useWeather, Skeleton
├── performance/    → Lighthouse (Web Vitals)
└── setup.ts        → Global mocks (fetch, i18n, localStorage, geo)

e2e/                → Tests E2E (Playwright)
├── pages/          → Page Object Model
├── specs/          → Test specs por feature
├── fixtures/       → Data de prueba
├── results/        → Screenshots y videos (gitignored)
└── report/         → Reporte HTML (gitignored)
```text

## Correr tests

```bash
# Unitarios
npm test                    # Correr todos
npm test -- --watch         # Watch mode
npm test -- tests/chat/     # Solo un módulo

# E2E
npm run test:e2e            # Headless
npm run test:e2e:ui         # Con UI de Playwright
npm run test:e2e:headed     # Con browser visible
npm run test:e2e:report     # Ver reporte HTML

# Performance
./tests/performance/run_lighthouse.sh
```text

## Convenciones

- Un archivo de test por componente/hook/util
- Nombrar: `[nombre].test.ts` o `[nombre].test.tsx`
- Usar Page Object Model en E2E
- Mocks globales en `tests/setup.ts`
- No testear implementación, testear comportamiento
- Tests deben ser independientes entre sí
