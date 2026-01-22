/**
 * 🧭 useGooglePlaceDetails.ts
 * Hook pour récupérer les informations d’un lieu Google Maps via son placeId.
 */

import { Waypoint } from "./useDirections";

/**
 * Hook sans dépendance directe : renvoie une fonction utilisable partout
 */
export function useGooglePlaceDetails() {
  /**
   * Récupère les détails d’un lieu (nom, coordonnées, adresse, photos, etc.)
   * @param placeId - Identifiant unique du lieu Google Maps
   * @param onResult - Callback avec les données formatées de type Waypoint
   */
  const fetchPlaceDetails = (
    placeId: string,
    onResult: (wp: Waypoint) => void
  ) => {
    if (!(window as any).google) return;

    const g = (window as any).google as typeof google;
    const service = new g.maps.places.PlacesService(document.createElement("div"));

    service.getDetails(
      {
        placeId,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "rating",
          "photos",
          "place_id",
        ],
      },
      (details, status) => {
        if (status !== g.maps.places.PlacesServiceStatus.OK || !details) return;

        const lat = details.geometry?.location?.lat() ?? 0;
        const lng = details.geometry?.location?.lng() ?? 0;

        const waypoint: Waypoint = {
          lat,
          lng,
          name: details.name || "Lieu sans nom",
          address: details.formatted_address || "Adresse inconnue",
          place_id: details.place_id,
          rating: details.rating,
          photos:
            details.photos?.map((p) => p.getUrl({ maxWidth: 800 })) ?? [],
        };

        onResult(waypoint);
      }
    );
  };

  return fetchPlaceDetails;
}
