const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
      {
        headers: { "Accept-Language": "es" },
      },
    );
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    if (data.display_name) {
      // Acortar: tomar solo las primeras 2-3 partes
      const parts = data.display_name.split(",");
      return parts.slice(0, 3).join(",").trim();
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
