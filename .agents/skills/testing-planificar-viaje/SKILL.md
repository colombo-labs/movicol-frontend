---
name: testing-planificar-viaje
description: Test the Planificar Viaje (route prediction) feature end-to-end. Use when verifying route search, congestion labels, alternative routes, auto-recalculation, or wait estimation UI changes.
---

# Testing: Planificar Viaje (Route Prediction)

## Prerequisites

### Services Required
1. **AI Service** (FastAPI, port 8000): `cd /home/ubuntu/repos/movicol-ai && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000`
2. **Backend** (NestJS, port 3001): `cd /home/ubuntu/repos/movicol-backend && npm run start:dev`
3. **Frontend** (Vite, port 3000): `cd /home/ubuntu/repos/movicol-frontend && npm run dev`

Verify all services are healthy before testing:
- `curl -s http://localhost:8000/health`
- `curl -s http://localhost:3001/api/health`
- `curl http://localhost:3000` (should return HTML)

### Devin Secrets Needed
None required for local testing. All services run locally without auth.

## How to Test

### Setting Origin and Destination
- The Planificar Viaje panel is the default active panel (leftmost nav icon)
- Click on the map to set origin (green marker), click again for destination (red marker)
- Good test coordinates: origin near Ciudad Hayuelos area (~4.6486, -74.1002), destination near El Rincon (~4.7110, -74.0721) - these reliably produce 7 route results
- Wait for "X opciones encontradas" text to appear

### Key UI Elements to Verify
1. **Route cards**: Each card shows route label (e.g. "TM G157", "SITP C157"), time in minutes, distance in km, cost in COP, congestion label, walking time
2. **Congestion labels**: Spanish translations - "Fluido" (green), "Moderado" (yellow), "Congestionado" (orange), "Muy congestionado" (red)
3. **Route detail** (scroll down after selecting a card): Itinerary with stops, congestion bar with percentage, wait estimation section
4. **Wait estimation section**: "Tiempo de espera: X min" and "Ocupacion del bus: X%" - the wait time should NOT always be 5 (that's the fallback)
5. **Transfer routes**: Cards like "TM 1 + SITP C157" show "1 transbordo" badge

### Testing Time-Based Auto-Recalculation
The HTML `<input type="time">` element might not respond to direct typing via computer-use tools. Use a Playwright CDP script instead:

```javascript
// set_time.js - Connect to Chrome via CDP and set time input value
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:29229');
  const contexts = browser.contexts();
  const page = contexts[0].pages()[0];
  await page.evaluate((timeVal) => {
    const input = document.querySelector('input[type="time"]');
    if (!input) { console.log('No time input found'); return; }
    const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSet.call(input, timeVal);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, '03:00'); // or '08:00' for rush hour
  // Wait for recalculation
  await page.waitForTimeout(3000);
  await browser.close();
})();
```

Install playwright first: `npm install playwright` in a working directory (not in the repo).

### Expected Behavior by Time
- **03:00 AM**: Low congestion - labels should show "Fluido", lower travel times
- **08:00 AM**: Rush hour - labels should show "Moderado", higher travel times (roughly 20% increase)
- Route ordering may change between times (fastest route at 3am might differ from 8am)

### Selecting Different Routes
- Click any route card to select it
- The detail panel below should update to show that route's information
- Map polylines should change to show the selected route
- Each route has different stop counts and stop names

## Common Issues

- **Time input not responding to typing**: Use Playwright CDP script as described above. The React onChange handler requires proper event dispatching.
- **"0 opciones encontradas"**: Check that AI service is running and has loaded the SITP graph. Check backend logs for proxy errors.
- **All routes show "5 min" wait time**: The AI service might not be returning `estimated_wait_minutes`. Check the AI `/api/v1/predict-route` response directly.
- **No congestion labels visible**: Check that the `congestion_risk` field is being returned by the AI and that the frontend's `getCongestionLabel()` function handles the thresholds correctly (<=0.25 Fluido, <=0.50 Moderado, <=0.75 Congestionado, >0.75 Muy congestionado).

## Test Checklist
1. Route search returns multiple options (>2 cards)
2. Congestion labels in Spanish on cards
3. Wait estimation with real values (not always 5)
4. Congestion bar with percentage in detail view
5. Auto-recalculation when time changes (no button click needed)
6. Alternative route cards with route codes
7. Selecting different cards updates detail and map
