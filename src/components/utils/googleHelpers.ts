/**
 * 🌍 googleHelpers.ts
 * Fonctions utilitaires liées à l'API Google Maps (Places, Geocoder, etc.)
 */

export function reverseGeocode(
  lat: number,
  lng: number,
  callback: (address: string) => void
) {
  if (!(window as any).google) {
    console.error("❌ Google Maps non chargé");
    callback("Adresse inconnue");
    return;
  }

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === "OK" && results && results[0]) {
      callback(results[0].formatted_address);
    } else {
      console.warn("⚠️ Reverse geocoding échoué :", status);
      callback("Adresse non disponible");
    }
  });
}

/**
 * Récupère les détails d’un lieu via PlacesService
 */
export function fetchPlaceDetails(
  map: google.maps.Map,
  placeId: string,
  fields: string[],
  callback: (details: google.maps.places.PlaceResult | null) => void
) {
  const service = new google.maps.places.PlacesService(map);
  service.getDetails({ placeId, fields }, (details, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && details) {
      callback(details);
    } else {
      console.warn("⚠️ Impossible de récupérer les détails du lieu :", status);
      callback(null);
    }
  });
}
