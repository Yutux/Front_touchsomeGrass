import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Chip,
  Stack,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SpeedDial,
  SpeedDialAction,
} from "@mui/material";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import RouteIcon from "@mui/icons-material/AltRoute";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveIcon from "@mui/icons-material/Save";

type Waypoint = {
  lat: number;
  lng: number;
  name: string;
  address?: string;
  place_id?: string;
  rating?: number;
  photos?: string[];
};

type TravelModeString = "WALKING" | "DRIVING" | "BICYCLING" | "TRANSIT";

const center = { lat: 48.8566, lng: 2.3522 };

export default function TrajetMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBHiBCqOdyA356J87JgT3ZWnKR2zr7_Rvs",
    libraries: ["places"],
  });

  // Refs carte & directions
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const routeSeqRef = useRef(0); // garde anti-course

  // State
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [autoRef, setAutoRef] = useState<google.maps.places.Autocomplete | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<TravelModeString>("WALKING");

  // Form (exemple)
  const [spotData, setSpotData] = useState({
    name: "",
    description: "",
    region: "",
    difficultyLevel: 1,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  /** ───────────────────────── MAP ───────────────────────── **/
  const handleMapLoad = (map: google.maps.Map): void => {
    mapRef.current = map;

    // (re)attacher le listener click proprement
    if (clickListenerRef.current) {
      clickListenerRef.current.remove();
      clickListenerRef.current = null;
    }
    clickListenerRef.current = map.addListener("click", (e: any) => {
      if (!(window as any).google) return;
      if (e.placeId) {
        e.stop();
        fetchPlaceDetails(e.placeId);
      } else if (e.latLng) {
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      }
    });
  };

  /** ───────────────────────── PLACES HELPERS ───────────────────────── **/
  const fetchPlaceDetails = (placeId: string) => {
    const g = (window as any).google as typeof google;
    const service = new g.maps.places.PlacesService(document.createElement("div"));
    service.getDetails(
      {
        placeId,
        fields: ["name", "formatted_address", "geometry", "rating", "photos", "place_id"],
      },
      (details, status) => {
        if (status !== g.maps.places.PlacesServiceStatus.OK || !details) return;
        const lat = details.geometry?.location?.lat() ?? 0;
        const lng = details.geometry?.location?.lng() ?? 0;

        addWaypoint({
          lat,
          lng,
          name: details.name || "Lieu",
          address: details.formatted_address || "",
          place_id: details.place_id || placeId,
          rating: details.rating,
          photos: details.photos?.map((p) => p.getUrl({ maxWidth: 800 })) || [],
        });
      }
    );
  };

  const reverseGeocode = (lat: number, lng: number) => {
    const g = (window as any).google as typeof google;
    const geocoder = new g.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const poi = results.find((r) => r.types?.includes("point_of_interest")) || results[0];
        addWaypoint({
          lat,
          lng,
          name: (poi as any).name || poi.formatted_address || "Point ajouté",
          address: poi.formatted_address,
          place_id: poi.place_id,
        });
      } else {
        addWaypoint({ lat, lng, name: "Point ajouté" });
      }
    });
  };

  /** ───────────────────────── WAYPOINTS OPS ───────────────────────── **/
  const addWaypoint = (wp: Waypoint) => {
    setWaypoints((prev) => {
      if (wp.place_id && prev.some((p) => p.place_id === wp.place_id)) return prev;
      return [...prev, wp];
    });
  };

  const removeWaypoint = (index: number) => {
    setWaypoints((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length >= 2) {
        calculateRoute(updated, travelMode);
      } else {
        invalidateAndClearRoute();
      }
      return updated;
    });
  };

  const focusWaypoint = (wp: Waypoint) => {
    mapRef.current?.panTo({ lat: wp.lat, lng: wp.lng });
    mapRef.current?.setZoom(15);
  };

  /** ───────────────────────── DIRECTIONS ───────────────────────── **/
  const invalidateAndClearRoute = () => {
    routeSeqRef.current++; // invalider les réponses en vol
    try {
      directionsRendererRef.current?.setDirections({ routes: [] } as any);
      directionsRendererRef.current?.setMap(null);
    } catch {}
    setDirections(null);
    setDistance(null);
    setDuration(null);
  };

  const calculateRoute = (points: Waypoint[], mode: TravelModeString) => {
    const g = (window as any).google as typeof google;
    const mySeq = ++routeSeqRef.current;
    if (!(window as any).google || points.length < 2) {
      invalidateAndClearRoute();
      return;
    }

    // s’assurer que le renderer est attaché
    try {
      directionsRendererRef.current?.setMap(mapRef.current!);
    } catch {}

    const ds = new g.maps.DirectionsService();
    ds.route(
      {
        origin: points[0],
        destination: points[points.length - 1],
        waypoints: points.slice(1, -1).map((p) => ({ location: { lat: p.lat, lng: p.lng } })),
        travelMode: g.maps.TravelMode[mode],
      },
      (result, status) => {
        if (mySeq !== routeSeqRef.current) return; // réponse tardive -> ignore

        if (status === "OK" && result) {
          try {
            directionsRendererRef.current?.setDirections(result);
          } catch {}
          setDirections(result);

          // distance/durée totales
          const route = result.routes[0];
          let d = 0,
            t = 0;
          route.legs.forEach((leg) => {
            d += leg.distance?.value || 0;
            t += leg.duration?.value || 0;
          });
          setDistance(`${(d / 1000).toFixed(1)} km`);
          setDuration(`${Math.round(t / 60)} min`);
        } else {
          invalidateAndClearRoute();
        }
      }
    );
  };

  // recalcul auto
  useEffect(() => {
    if (waypoints.length >= 2) calculateRoute(waypoints, travelMode);
    else invalidateAndClearRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints, travelMode]);

  /** ───────────────────────── ACTIONS UI ───────────────────────── **/
  const recalc = () => {
    if (waypoints.length >= 2) calculateRoute(waypoints, travelMode);
  };

  const hardReset = () => {
    // reset total (route + points + listeners)
    invalidateAndClearRoute();
    setWaypoints([]);

    if (mapRef.current) {
      const g = (window as any).google as typeof google;
      g.maps.event.clearListeners(mapRef.current, "click");
      mapRef.current.setZoom(13);
      mapRef.current.panTo(center);
      // ré-attacher le listener
      clickListenerRef.current = mapRef.current.addListener("click", (e: any) => {
        if (e.placeId) {
          e.stop();
          fetchPlaceDetails(e.placeId);
        } else if (e.latLng) {
          reverseGeocode(e.latLng.lat(), e.latLng.lng());
        }
      });
    }
  };

  /** ───────────────────────── ENVOI BACKEND (CREATE) ───────────────────────── **/
  const parseDistance = (val: string | null) => (val ? parseFloat(val.replace(" km", "")) : 0);
  const parseDuration = (val: string | null) => (val ? parseFloat(val.replace(" min", "")) : 0);

  const buildCreatePayload = () => {
    return {
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
    };
  };

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
      if (!res.ok) {
        throw new Error(data?.message || `Erreur ${res.status}`);
      }
      alert("✅ Randonnée enregistrée avec succès !");
      //reset form
      hardReset();
      setSpotData({ name: "", description: "", region: "", difficultyLevel: 1 });
      setSelectedFiles([]);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Erreur lors de l'enregistrement");
    }
  };

  if (!isLoaded) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Chargement de la carte…</Typography>
      </Box>
    );
  }

  const speedDialActions = [
    { icon: <RouteIcon />, name: "Recalculer", onClick: recalc },
    { icon: <ReplayIcon />, name: "Réinitialiser", onClick: hardReset },
    { icon: <SaveIcon />, name: "Enregistrer", onClick: sendCreate },
  ];

  return (
    <Box sx={{ width: "100vw", height: "90vh", display: "flex", gap: 2, p: 2 }}>
      {/* Carte */}
      <Paper elevation={2} sx={{ flex: 1, minWidth: 0, borderRadius: 2, overflow: "hidden" }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={waypoints[0] || center}
          zoom={13}
          onLoad={handleMapLoad}
          onUnmount={() => {
            if (clickListenerRef.current) {
              clickListenerRef.current.remove();
              clickListenerRef.current = null;
            }
            try {
              directionsRendererRef.current?.setDirections({ routes: [] } as any);
              directionsRendererRef.current?.setMap(null);
            } catch {}
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

          {/* Renderer contrôlé par ref pour éviter les “lignes fantômes” */}
          <DirectionsRenderer
            options={{ suppressMarkers: true }}
            onLoad={(r) => {
              directionsRendererRef.current = r;
              directionsRendererRef.current.setMap(mapRef.current!);
              if (directions) {
                // si on (re)monte pendant qu’on a déjà un résultat
                try {
                  directionsRendererRef.current.setDirections(directions);
                } catch {}
              }
            }}
            onUnmount={() => {
              try {
                directionsRendererRef.current?.setMap(null);
              } catch {}
              directionsRendererRef.current = null;
            }}
          />
        </GoogleMap>
      </Paper>

      {/* Panneau latéral avec Accordion + SpeedDial */}
      <Box sx={{ width: 380, display: "flex", flexDirection: "column", gap: 1, position: "relative" }}>
        {/* Mode + distance/durée */}
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            🥾 Créer une randonnée
          </Typography>

          <ToggleButtonGroup
            value={travelMode}
            exclusive
            size="small"
            onChange={(_, val) => val && setTravelMode(val as TravelModeString)}
            sx={{
              "& .MuiToggleButton-root": { p: 0.5, minWidth: 36 }, // compact
            }}
          >
            <ToggleButton value="WALKING" aria-label="walking">
              <DirectionsWalkIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="DRIVING" aria-label="driving">
              <DirectionsCarIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="BICYCLING" aria-label="bicycling">
              <DirectionsBikeIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="TRANSIT" aria-label="transit">
              <DirectionsBusIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>


          {directions && (
            <Stack direction="row" spacing={1}>
              <Chip size="small" label={`Distance: ${distance}`} />
              <Chip size="small" label={`Durée: ${duration}`} />
            </Stack>
          )}
        </Paper>

        {/* Ajouter un point */}
        <Accordion defaultExpanded disableGutters sx={{ borderRadius: 2, overflow: "hidden" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={700}>📍 Ajouter un point</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Autocomplete
              onLoad={(ref) => setAutoRef(ref)}
              onPlaceChanged={() => {
                const place = autoRef?.getPlace();
                if (!place || !place.geometry?.location) return;
                addWaypoint({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  name: place.name || "Lieu",
                  place_id: place.place_id,
                  address: place.formatted_address,
                });
              }}
            >
              <TextField size="small" fullWidth placeholder="Rechercher un lieu" />
            </Autocomplete>
          </AccordionDetails>
        </Accordion>

        {/* Points du parcours */}
        <Accordion defaultExpanded disableGutters sx={{ borderRadius: 2, overflow: "hidden" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={700}>📌 Points du parcours</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {waypoints.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Ajoute au moins 2 points pour créer un itinéraire.
              </Typography>
            )}
            <Stack spacing={1}>
              {waypoints.map((wp, i) => (
                <Paper
                  key={`${wp.lat}-${wp.lng}-${i}`}
                  variant="outlined"
                  sx={{ p: 1, borderRadius: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Chip size="small" label={i + 1} color="primary" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap title={wp.name}>
                      {wp.name}
                    </Typography>
                    {wp.address && (
                      <Typography variant="caption" color="text.secondary" noWrap title={wp.address}>
                        {wp.address}
                      </Typography>
                    )}
                  </Box>
                  <Tooltip title="Centrer">
                    <IconButton size="small" onClick={() => focusWaypoint(wp)}>
                      <CenterFocusStrongIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" color="error" onClick={() => removeWaypoint(i)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Infos parcours */}
        <Accordion disableGutters sx={{ borderRadius: 2, overflow: "hidden" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={700}>🧭 Infos du parcours</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Nom"
                value={spotData.name}
                onChange={(e) => setSpotData({ ...spotData, name: e.target.value })}
                fullWidth
              />
              <TextField
                size="small"
                label="Description"
                value={spotData.description}
                onChange={(e) => setSpotData({ ...spotData, description: e.target.value })}
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                size="small"
                label="Région"
                value={spotData.region}
                onChange={(e) => setSpotData({ ...spotData, region: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth size="small">
                <InputLabel>Difficulté</InputLabel>
                <Select
                  label="Difficulté"
                  value={spotData.difficultyLevel.toString()}
                  onChange={(e) =>
                    setSpotData({ ...spotData, difficultyLevel: Number(e.target.value) })
                  }
                >
                  <MenuItem value={1}>Facile</MenuItem>
                  <MenuItem value={2}>Modérée</MenuItem>
                  <MenuItem value={3}>Difficile</MenuItem>
                  <MenuItem value={4}>Expert</MenuItem>
                  <MenuItem value={5}>Extrême</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Images */}
        <Accordion disableGutters sx={{ borderRadius: 2, overflow: "hidden" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={700}>🖼️ Images</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Button variant="outlined" component="label" fullWidth>
              Sélectionner des fichiers
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              />
            </Button>
            {selectedFiles.length > 0 && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                  gap: 1,
                  mt: 2,
                }}
              >
                {selectedFiles.map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt={`upload-${i}`}
                    style={{
                      width: "100%",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                ))}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* SpeedDial flottant */}
        <Box sx={{ position: "absolute", bottom: 8, right: 8 }}>
          <SpeedDial ariaLabel="Actions" icon={<RouteIcon />}>
            {speedDialActions.map((a) => (
              <SpeedDialAction
                key={a.name}
                icon={a.icon}
                tooltipTitle={a.name}
                onClick={a.onClick}
              />
            ))}
          </SpeedDial>
        </Box>
      </Box>
    </Box>
  );
}
