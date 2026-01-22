import React, { useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import RouteSummary from "./RouteSummary";
import WaypointList from "./WaypointList";
import RouteForm from "./RouteForm";
import UploadSection from "./UploadSection";
import SpeedDialActions from "./SpeedDialActions";
import MapContainer from "./MapContainer";

import { useGooglePlaceDetails } from "../../hooks/useGooglePlaceDetails";
import { useReverseGeocode } from "../../hooks/useReverseGeocode";
import { useDirections, Waypoint, TravelModeString } from "../../hooks/useDirections";
import { parseDistance, parseDuration } from "../../components/utils/parseHelpers";

const center = { lat: 48.8566, lng: 2.3522 };

export default function TrajetMap() {
  /** ─────────────── Refs ─────────────── **/
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  /** ─────────────── State principal ─────────────── **/
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [travelMode, setTravelMode] = useState<TravelModeString>("WALKING");

  // Données du spot (formulaire)
  const [spotData, setSpotData] = useState({
    name: "",
    description: "",
    region: "",
    difficultyLevel: 1,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [autoRef, setAutoRef] = useState<google.maps.places.Autocomplete | null>(null);

  /** ─────────────── Hooks Google & Directions ─────────────── **/
  const fetchPlaceDetails = useGooglePlaceDetails();
  const reverseGeocode = useReverseGeocode();
  const { directions, distance, duration, calculateRoute, clearRoute } = useDirections();

  /** ─────────────── Gestion carte ─────────────── **/
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    if (clickListenerRef.current) {
      clickListenerRef.current.remove();
      clickListenerRef.current = null;
    }

    clickListenerRef.current = map.addListener("click", (e: any) => {
      if (e.placeId) {
        e.stop();
        fetchPlaceDetails(e.placeId, (details: Waypoint) => addWaypoint(details));
      } else if (e.latLng) {
        reverseGeocode(e.latLng.lat(), e.latLng.lng(), (res: Waypoint) => addWaypoint(res));
      }
    });
  };

  /** ─────────────── Waypoints ─────────────── **/
  const addWaypoint = (wp: Waypoint) => {
    setWaypoints((prev) => {
      if (wp.place_id && prev.some((p) => p.place_id === wp.place_id)) return prev;
      return [...prev, wp];
    });
  };

  const removeWaypoint = (index: number) => {
    setWaypoints((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length >= 2 && mapRef.current && directionsRendererRef.current) {
        calculateRoute(mapRef.current, directionsRendererRef.current, updated, travelMode);
      } else {
        clearRoute(directionsRendererRef.current);
      }
      return updated;
    });
  };

  const focusWaypoint = (wp: Waypoint) => {
    mapRef.current?.panTo({ lat: wp.lat, lng: wp.lng });
    mapRef.current?.setZoom(15);
  };

  /** ─────────────── Itinéraire (directions) ─────────────── **/
  useEffect(() => {
    if (waypoints.length >= 2 && mapRef.current && directionsRendererRef.current) {
      calculateRoute(mapRef.current, directionsRendererRef.current, waypoints, travelMode);
    } else {
      clearRoute(directionsRendererRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints, travelMode]);

  /** ─────────────── Création backend ─────────────── **/
  const buildCreatePayload = () => ({
    name: spotData.name || "Randonnée sans nom",
    description: spotData.description || "Aucune description",
    region: spotData.region || "Région inconnue",
    distance: parseDistance(distance),
    duration: parseDuration(duration),
    travelMode,
    difficultyLevel: spotData.difficultyLevel,
    startLatitude: waypoints[0]?.lat || 0,
    startLongitude: waypoints[0]?.lng || 0,
    endLatitude: waypoints[waypoints.length - 1]?.lat || 0,
    endLongitude: waypoints[waypoints.length - 1]?.lng || 0,
    imageUrls: waypoints.flatMap((wp) => wp.photos ?? []),
    waypoints: waypoints.map((wp) => ({
      name: wp.name,
      address: wp.address,
      placeId: wp.place_id,
      latitude: wp.lat,
      longitude: wp.lng,
      rating: wp.rating,
      photos: wp.photos ?? [],
    })),
  });

  const sendCreate = async () => {
    if (waypoints.length < 2) {
      alert("Ajoute au moins 2 points pour créer un itinéraire.");
      return;
    }

    const payload = buildCreatePayload();
    const fd = new FormData();
    fd.append("spot", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    selectedFiles.forEach((f) => fd.append("files", f));

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/create", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Erreur ${res.status}`);

      alert("✅ Randonnée enregistrée avec succès !");
      resetForm();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Erreur lors de l'enregistrement");
    }
  };

  const resetForm = () => {
    clearRoute(directionsRendererRef.current);
    setWaypoints([]);
    setSpotData({ name: "", description: "", region: "", difficultyLevel: 1 });
    setSelectedFiles([]);
    mapRef.current?.setZoom(13);
    mapRef.current?.panTo(center);
  };

  /** ─────────────── Rendu UI ─────────────── **/
  return (
    <MapContainer>
      <Box sx={{ width: "100vw", height: "90vh", display: "flex", gap: 2, p: 2 }}>
        {/* 🗺️ Carte principale */}
        <Paper elevation={2} sx={{ flex: 1, minWidth: 0, borderRadius: 2, overflow: "hidden" }}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={waypoints[0] || center}
            zoom={13}
            onLoad={handleMapLoad}
            onUnmount={() => {
              clickListenerRef.current?.remove();
              directionsRendererRef.current?.setMap(null);
              directionsRendererRef.current = null;
              mapRef.current = null;
            }}
          >
            {waypoints.map((wp, i) => (
              <Marker
                key={`${wp.lat}-${wp.lng}-${i}`}
                position={{ lat: wp.lat, lng: wp.lng }}
                label={`${i + 1}`}
              />
            ))}

            <DirectionsRenderer
              options={{ suppressMarkers: true }}
              onLoad={(r) => {
                directionsRendererRef.current = r;
                directionsRendererRef.current.setMap(mapRef.current!);
                if (directions) directionsRendererRef.current.setDirections(directions);
              }}
              onUnmount={() => directionsRendererRef.current?.setMap(null)}
            />
          </GoogleMap>
        </Paper>

        {/* 📋 Panneau latéral */}
        <Box sx={{ width: 380, display: "flex", flexDirection: "column", gap: 1, position: "relative" }}>
          <RouteSummary
            travelMode={travelMode}
            setTravelMode={setTravelMode}
            distance={distance}
            duration={duration}
          />

          <WaypointList
            waypoints={waypoints}
            addWaypoint={addWaypoint}
            removeWaypoint={removeWaypoint}
            focusWaypoint={focusWaypoint}
            autoRef={autoRef}
            setAutoRef={setAutoRef}
          />

          <RouteForm spotData={spotData} setSpotData={setSpotData} />

          <UploadSection selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />

          <SpeedDialActions sendCreate={sendCreate} />
        </Box>
      </Box>
    </MapContainer>
  );
}
