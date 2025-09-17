// import React, { useState } from "react";
// import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";

// const containerStyle = {
//   width: "100%",
//   height: "500px",
// };

// const center = {
//   lat: 48.8566,
//   lng: 2.3522, // Paris
// };

// export default function TrajetMap() {
//   const [waypoints, setWaypoints] = useState<{ lat: number; lng: number }[]>([]);
//   const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);


//   // Ajoute un point d'arrêt au clic sur la carte
//   const handleMapClick = (e: google.maps.MapMouseEvent) => {
//     const lat = e.latLng?.lat();
//     const lng = e.latLng?.lng();
//     if (lat && lng) {
//       setWaypoints([...waypoints, { lat, lng }]);
//     }
//   };

//   // Demande l'itinéraire dès qu'il y a au moins 2 points
//   React.useEffect(() => {
//     if (waypoints.length < 2) {
//       setDirections(null);
//       return;
//     }
//     // Prépare la requête Directions
//     const origin = waypoints[0];
//     const destination = waypoints[waypoints.length - 1];
//     const google = window.google;
//     const waypts =
//       waypoints.length > 2
//         ? waypoints.slice(1, -1).map((pt) => ({
//             location: pt,
//             stopover: true,
//           }))
//         : [];

//     const directionsService = new google.maps.DirectionsService();
//     directionsService.route(
//       {
//         origin,
//         destination,
//         waypoints: waypts,
//         travelMode: google.maps.TravelMode.WALKING, // ou BICYCLING
//       },
//       (result, status) => {
//         if (status === google.maps.DirectionsStatus.OK) {
//           setDirections(result);
//         } else {
//           setDirections(null);
//         }
//       }
//     );
//   }, [waypoints]);

//   // Réinitialise les points d'arrêt
//   const resetWaypoints = () => setWaypoints([]);

//   return (
//     <LoadScript googleMapsApiKey="AIzaSyBHiBCqOdyA356J87JgT3ZWnKR2zr7_Rvs" libraries={["places"]}>
//       <div style={{ marginBottom: 10 }}>
//         <button onClick={resetWaypoints}>Réinitialiser le trajet</button>
//         <span style={{ marginLeft: 10 }}>
//           Points d'arrêt : {waypoints.length}
//         </span>
//       </div>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={waypoints[0] || center}
//         zoom={13}
//         onClick={handleMapClick}
//       >
//         {/* Markers pour chaque point d'arrêt */}
//         {waypoints.map((point, idx) => (
//           <Marker key={idx} position={point} label={`${idx + 1}`} />
//         ))}
//         {/* Affichage du trajet */}
//         {directions && <DirectionsRenderer directions={directions} />}
//       </GoogleMap>
//     </LoadScript>
//   );
// }
import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  Autocomplete,
} from "@react-google-maps/api";

const containerStyle = {
  width: "70%",
  height: "600px",
};

const sidePanelStyle = {
  width: "30%",
  height: "600px",
  overflowY: "auto" as const,
  padding: "10px",
  borderLeft: "2px solid #ccc",
};

const center = {
  lat: 48.8566,
  lng: 2.3522,
};

type Waypoint = {
  lat: number;
  lng: number;
  name: string;
  place_id?: string;
  types?: string[];
  address?: string;
  raw?: any;
};

export default function TrajetMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  // ➕ Ajouter un waypoint par clic sur la carte
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !map) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const placesService = new google.maps.places.PlacesService(map);

    // Cherche un POI précis
    const request: google.maps.places.PlaceSearchRequest = {
      location: e.latLng,
      radius: 20,
      type: "point_of_interest", // ✅ string au lieu de string[]
    };

    placesService.nearbySearch(request, (results, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results.length > 0
      ) {
        const poi = results[0];
        if (!poi.place_id) return;
        placesService.getDetails(
          { placeId: poi.place_id! }, // ✅ ajoute le ! pour TS
          (details, detailsStatus) => {
            if (
              detailsStatus ===
                google.maps.places.PlacesServiceStatus.OK &&
              details
            ) {
              const waypointData: Waypoint = {
                lat,
                lng,
                name: details.name || "Lieu inconnu", // ✅ fallback
                place_id: details.place_id,
                types: details.types,
                address: details.formatted_address,
                raw: details,
              };
              console.log("📍 POI exact :", waypointData);
              addWaypointFull(waypointData);
            }
          }
        );
      } else {
        // fallback Geocoder
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (geoResults, geoStatus) => {
          if (
            geoStatus === "OK" &&
            geoResults &&
            geoResults.length > 0
          ) {
            const firstResult = geoResults[0];
            const waypointData: Waypoint = {
              lat,
              lng,
              name: firstResult.formatted_address || "Lieu inconnu",
              place_id: firstResult.place_id,
              types: firstResult.types,
              raw: firstResult,
            };
            console.log("📍 Adresse fallback :", waypointData);
            addWaypointFull(waypointData);
          }
        });
      }
    });
  };

  const addWaypointFull = (data: Waypoint) => {
    const updated = [...waypoints, data];
    setWaypoints(updated);
    calculateRoute(updated);
  };

  // ➕ Ajouter un waypoint via recherche
  const handlePlaceSelected = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const waypointData: Waypoint = {
      lat,
      lng,
      name: place.name || place.formatted_address || "Lieu sélectionné",
      place_id: place.place_id,
      types: place.types,
      address: place.formatted_address,
      raw: place,
    };
    console.log("📍 Waypoint recherche :", waypointData);
    addWaypointFull(waypointData);
  };

  // ❌ Supprimer un waypoint
  const removeWaypoint = (index: number) => {
    const updated = waypoints.filter((_, i) => i !== index);
    setWaypoints(updated);
    calculateRoute(updated);
  };

  // 🔄 Réinitialiser
  const resetWaypoints = () => {
    setWaypoints([]);
    setDirections(null);
  };

  // 🛣️ Calcul itinéraire
  const calculateRoute = (points: { lat: number; lng: number }[]) => {
    if (points.length < 2) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: points[0],
        destination: points[points.length - 1],
        waypoints: points.slice(1, -1).map((p) => ({ location: p })),
        travelMode: google.maps.TravelMode.WALKING, // ou BICYCLING
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        } else {
          console.error("Erreur Directions API :", status);
        }
      }
    );
  };

  return (
    <LoadScript
      googleMapsApiKey=""
      libraries={["places"]}
    >
      <div style={{ display: "flex", width: "100%" }}>
        {/* MAP */}
        <div style={containerStyle}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={waypoints[0] || center}
            zoom={13}
            onLoad={(map) => setMap(map)}
            onClick={handleMapClick}
          >
            {waypoints.map((wp, idx) => (
              <Marker
                key={idx}
                position={{ lat: wp.lat, lng: wp.lng }}
                label={`${idx + 1}`}
              />
            ))}

            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{ suppressMarkers: true }}
              />
            )}
          </GoogleMap>
        </div>

        {/* SIDE PANEL */}
        <div style={sidePanelStyle}>
          <h3>Waypoints</h3>

          <Autocomplete
            onLoad={(ac) => setAutocomplete(ac)}
            onPlaceChanged={handlePlaceSelected}
          >
            <input
              type="text"
              placeholder="Rechercher un lieu"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </Autocomplete>

          {waypoints.length === 0 && <p>Aucun point ajouté</p>}
          <ul>
            {waypoints.map((wp, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <span>
                  {idx + 1}. {wp.name}
                </span>
                <button onClick={() => removeWaypoint(idx)}>❌</button>
              </li>
            ))}
          </ul>

          {waypoints.length > 0 && (
            <button onClick={resetWaypoints} style={{ marginTop: "10px" }}>
              🔄 Réinitialiser
            </button>
          )}
        </div>
      </div>
    </LoadScript>
  );

}
