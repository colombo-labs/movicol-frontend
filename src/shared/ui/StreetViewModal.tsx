/**
 * Opens Google Maps Street View in a new tab at the given coordinates.
 * No API key needed, always works.
 */
export function openStreetView(lat: number, lng: number) {
  window.open(
    `https://www.google.com/maps/@${lat},${lng},3a,75y,0h,90t/data=!3m4!1e1!3m2!1s!2e0`,
    "_blank",
  );
}
