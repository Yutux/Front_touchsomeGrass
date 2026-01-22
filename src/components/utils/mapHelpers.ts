/**
 * 🧠 mapHelpers.ts
 * Fonctions utilitaires pour manipuler la carte Google Maps
 */

export function addClickListener(
  map: google.maps.Map,
  handler: (e: google.maps.MapMouseEvent) => void
): google.maps.MapsEventListener {
  const listener = map.addListener("click", handler);
  return listener;
}

/**
 * Supprime tous les listeners de clic d'une carte
 */
export function clearClickListeners(map: google.maps.Map) {
  google.maps.event.clearListeners(map, "click");
}

/**
 * Centre la carte sur des coordonnées
 */
export function panTo(map: google.maps.Map, lat: number, lng: number, zoom: number = 14) {
  map.panTo({ lat, lng });
  map.setZoom(zoom);
}

/**
 * Réinitialise la carte à son état initial
 */
export function resetMap(map: google.maps.Map, center: { lat: number; lng: number }) {
  clearClickListeners(map);
  map.setZoom(13);
  map.panTo(center);
}

/**
 * Crée un marker avec animation DROP
 */
export function createMarker(lat: number, lng: number): google.maps.Marker {
  return new google.maps.Marker({
    position: { lat, lng },
    animation: google.maps.Animation.DROP,
  });
}
