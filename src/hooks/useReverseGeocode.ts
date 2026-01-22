/**
 * 🌍 useReverseGeocode.ts
 * Hook utilitaire pour convertir des coordonnées (lat, lng)
 * en une adresse lisible grâce au service Google Maps Geocoder.
 */

import { Waypoint } from "./useDirections";

export function useReverseGeocode() {
  /**
   * Récupère les informations d’adresse à partir de coordonnées GPS.
   * @param lat - Latitude du point
   * @param lng - Longitude du point
   * @param onResult - Callback avec un `Waypoint` minimal (adresse + coords)
   */
  const reverseGeocode = (
    lat: number,
    lng: number,
    onResult: (wp: Waypoint) => void
  ) => {
    if (!(window as any).google) return;

    const g = (window as any).google as typeof google;
    const geocoder = new g.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const result =
          results.find((r) => r.types?.includes("point_of_interest")) ||
          results[0];

        const waypoint: Waypoint = {
          lat,
          lng,
          name: (result as any).name || "Point ajouté",
          address: result.formatted_address || "Adresse inconnue",
          place_id: result.place_id,
        };

        onResult(waypoint);
      } else {
        // 🔹 Fallback si aucune adresse trouvée
        onResult({
          lat,
          lng,
          name: "Point manuel",
          address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        });
      }
    });
  };

  return reverseGeocode;
}
