/**
 * 🔄 useDirections.ts
 * Hook pour gérer les itinéraires Google Maps (Directions API)
 */

import { useRef, useState } from "react";
import { formatDistance, formatDuration } from "../components/utils/parseHelpers";

// 🧩 Type Waypoint commun à tout ton projet
export interface Waypoint {
  lat: number;
  lng: number;
  name: string;
  address?: string;
  place_id?: string;
  rating?: number;
  photos?: string[];
}

export type TravelModeString = "WALKING" | "DRIVING" | "BICYCLING" | "TRANSIT";

export function useDirections() {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const routeSeqRef = useRef(0);

  /**
   * Supprime la route affichée et réinitialise les infos
   */
  const clearRoute = (renderer: google.maps.DirectionsRenderer | null) => {
    routeSeqRef.current++;
    if (renderer) {
      try {
        renderer.setDirections({ routes: [] } as any);
        renderer.setMap(null);
      } catch {
        // no-op
      }
    }
    setDirections(null);
    setDistance(null);
    setDuration(null);
  };

  /**
   * Calcule un itinéraire entre plusieurs points
   */
  const calculateRoute = (
    map: google.maps.Map | null,
    renderer: google.maps.DirectionsRenderer | null,
    waypoints: Waypoint[],
    travelMode: TravelModeString
  ) => {
    const g = (window as any).google as typeof google;
    const seq = ++routeSeqRef.current;

    if (!map || !renderer || !g || waypoints.length < 2) {
      clearRoute(renderer);
      return;
    }

    renderer.setMap(map);
    const ds = new g.maps.DirectionsService();

    ds.route(
      {
        origin: waypoints[0],
        destination: waypoints[waypoints.length - 1],
        waypoints: waypoints.slice(1, -1).map((p) => ({
          location: { lat: p.lat, lng: p.lng },
        })),
        travelMode: g.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (seq !== routeSeqRef.current) return; // ignore si autre requête en vol
        if (status === "OK" && result) {
          try {
            renderer.setDirections(result);
          } catch {}
          setDirections(result);

          const route = result.routes[0];
          let d = 0,
            t = 0;
          route.legs.forEach((leg) => {
            d += leg.distance?.value || 0;
            t += leg.duration?.value || 0;
          });
          setDistance(formatDistance(d));
          setDuration(formatDuration(t));
        } else {
          clearRoute(renderer);
        }
      }
    );
  };

  return {
    directions,
    distance,
    duration,
    calculateRoute,
    clearRoute,
  };
}
