/**
 * 🧠 useMapEvents.ts
 * Hook pour gérer les clics et interactions sur la carte
 */

import { useEffect } from "react";
import { Waypoint } from "./useDirections";

interface UseMapEventsOptions {
  map: google.maps.Map | null;
  onPlaceClick: (placeId: string) => void;
  onManualClick: (lat: number, lng: number) => void;
}

/**
 * Gère les événements de clic sur la carte :
 * - Clic sur un lieu Google Maps (placeId)
 * - Clic manuel (ajout de point)
 */
export function useMapEvents({ map, onPlaceClick, onManualClick }: UseMapEventsOptions) {
  useEffect(() => {
    if (!map) return;

    const listener = map.addListener("click", (e: any) => {
      if (e.placeId) {
        e.stop();
        onPlaceClick(e.placeId);
      } else if (e.latLng) {
        onManualClick(e.latLng.lat(), e.latLng.lng());
      }
    });

    // Nettoyage
    return () => {
      if (listener) listener.remove();
    };
  }, [map, onPlaceClick, onManualClick]);
}

/**
 * Centrage de la carte sur un waypoint
 */
export function focusWaypoint(map: google.maps.Map | null, wp: Waypoint) {
  if (!map) return;
  map.panTo({ lat: wp.lat, lng: wp.lng });
  map.setZoom(15);
}
