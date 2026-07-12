const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

// Cache to avoid repeated requests for same coordinates
const geocodeCache = new Map<string, string>();

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  const fallback = `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  try {
    const res = await fetch(
      `${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
      {
        headers: { "Accept-Language": "es" },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) {
      geocodeCache.set(key, fallback);
      return fallback;
    }
    const data = await res.json();
    if (data.display_name) {
      const parts = data.display_name.split(",");
      // Return first 2-3 parts (street + neighborhood)
      const address = parts.slice(0, 3).join(",").trim();
      geocodeCache.set(key, address);
      return address;
    }
    geocodeCache.set(key, fallback);
    return fallback;
  } catch {
    geocodeCache.set(key, fallback);
    return fallback;
  }
}
