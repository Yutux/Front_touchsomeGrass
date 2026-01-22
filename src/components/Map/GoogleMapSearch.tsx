import React, { useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Grid,
  Modal,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

// 🔹 Import des sous-composants
import PhotoGrid from "./PhotoGrid";
import MapModal from "./MapModal";

// 🔹 Type partagé
import { PlaceData } from "../../types/place";

// 🔹 Fonctions utilitaires
import { reverseGeocode } from "../utils/googleHelpers";
import MapContainer from "./MapContainer";

const center = { lat: 48.8566, lng: 2.3522 }; // Paris
const GOOGLE_API_KEY = "AIzaSyBHiBCqOdyA356J87JgT3ZWnKR2zr7_Rvs";

export default function GoogleMapSearch({
  onPlaceSelected,
}: {
  onPlaceSelected: (place: PlaceData) => void;
}) {
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // ✅ Récupération des détails du lieu avec photo_reference
  const fetchPlaceDetails = (placeId: string) => {
    if (!mapRef.current) return;
    const service = new window.google.maps.places.PlacesService(mapRef.current);

    service.getDetails(
      {
        placeId,
        fields: ["name", "formatted_address", "geometry", "rating", "photos"],
      },
      (details, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
          const lat = details.geometry?.location?.lat() || center.lat;
          const lng = details.geometry?.location?.lng() || center.lng;

          const photoReferences: string[] = [];
          const photoUrls: string[] = [];

          if (details.photos && details.photos.length > 0) {
            details.photos.forEach((photo: any, index: number) => {
              try {
                const url = photo.getUrl({ maxWidth: 1200 });
                const match = url.match(/[?&]1s([^&]+)/);
                if (match && match[1]) {
                  const photoRef = match[1];
                  photoReferences.push(photoRef);
                }
                photoUrls.push(url);
              } catch (error) {
                console.error(`Erreur photo ${index + 1}:`, error);
              }
            });
          }

          const placeData: PlaceData = {
            name: details.name || "Lieu inconnu",
            address: details.formatted_address || "Adresse non disponible",
            latitude: lat,
            longitude: lng,
            rating: details.rating,
            photoReferences,
            photoUrls,
          };

          setSelectedPlace(placeData);
          setMarkerPosition({ lat, lng });

          mapRef.current?.panTo({ lat, lng });
          mapRef.current?.setZoom(15);

          onPlaceSelected(placeData);
        }
      }
    );
  };

  // ✅ Recherche via la barre
  const handlePlacesChanged = () => {
    if (!searchBoxRef.current) return;
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      if (place.place_id) fetchPlaceDetails(place.place_id);
    }
  };

  // ✅ Géocoder les clics manuels
  const handleReverseGeocode = (lat: number, lng: number) => {
    reverseGeocode(lat, lng, (address) => {
      const placeData: PlaceData = {
        name: "Lieu choisi manuellement",
        address,
        latitude: lat,
        longitude: lng,
        photoReferences: [],
        photoUrls: [],
      };
      setSelectedPlace(placeData);
      onPlaceSelected(placeData);
    });
  };

  // ✅ Clic sur la carte
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (!lat || !lng) return;
    setMarkerPosition({ lat, lng });
    handleReverseGeocode(lat, lng);
  };

  // ✅ Support des clics sur lieux natifs Google Maps
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    map.addListener("click", (e: any) => {
      if (e.placeId) {
        e.stop();
        fetchPlaceDetails(e.placeId);
      } else {
        handleMapClick(e);
      }
    });
  };

  // ✅ Envoi au backend
  const handleSubmit = async () => {
    if (!selectedPlace) {
      alert("Veuillez d'abord choisir un lieu !");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vous devez être connecté !");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      const spotData = {
        name: selectedPlace.name,
        description,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        imagePath: "",
        imageUrls: selectedPlace.photoReferences || [],
        creator: null,
      };

      formData.append("spot", new Blob([JSON.stringify(spotData)], { type: "application/json" }));
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("http://localhost:8088/AUTH-SERVICE/api/v1/spots/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();

      alert(`✅ Spot créé avec succès !\n${result.message}`);
      setSelectedPlace(null);
      setMarkerPosition(null);
      setDescription("");
      setFiles([]);
    } catch (error: any) {
      setSubmitError(error.message || "Erreur lors de la création du spot");
      alert("❌ " + (error.message || "Erreur lors de la création du spot"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Navigation modale
  const handlePrev = () => {
    if (openIndex !== null && selectedPlace?.photoUrls) {
      setOpenIndex((openIndex - 1 + selectedPlace.photoUrls.length) % selectedPlace.photoUrls.length);
    }
  };
  const handleNext = () => {
    if (openIndex !== null && selectedPlace?.photoUrls) {
      setOpenIndex((openIndex + 1) % selectedPlace.photoUrls.length);
    }
  };

  return (
    <MapContainer>
      <Box sx={{ width: "100vw", maxWidth: "100%", overflow: "hidden", px: 2, mt: 3 }}>
        <Grid container rowSpacing={2} columnSpacing={2} sx={{ height: "85vh", width: "100%", margin: 0 }}>
          {/* 🗺️ Carte */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", boxShadow: 4, height: "100%", width: "100%" }}>
              <Card
                sx={{
                  position: "absolute",
                  top: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 10,
                  width: 400,
                  borderRadius: 3,
                  boxShadow: 6,
                }}
              >
                <CardContent>
                  <StandaloneSearchBox onLoad={(ref) => (searchBoxRef.current = ref)} onPlacesChanged={handlePlacesChanged}>
                    <TextField fullWidth label="Rechercher un lieu" variant="outlined" size="small" placeholder="Ex: Tour Eiffel, Paris" />
                  </StandaloneSearchBox>
                </CardContent>
              </Card>

              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={markerPosition || center}
                zoom={13}
                onLoad={handleMapLoad}
              >
                {markerPosition && <Marker position={markerPosition} animation={window.google.maps.Animation.DROP} />}
              </GoogleMap>
            </Box>
          </Grid>

          {/* ℹ️ Détails + Formulaire */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: "100%", overflowY: "auto", p: 2, boxShadow: 4, borderRadius: 3 }}>
              {!selectedPlace ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" mt={20}>
                  🗺️ Cliquez sur la carte ou recherchez un lieu
                </Typography>
              ) : (
                <>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedPlace.name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {selectedPlace.address}
                  </Typography>

                  <PhotoGrid photos={selectedPlace.photoUrls ?? []} onOpen={setOpenIndex} />

                  <TextField
                    label="Description"
                    multiline
                    minRows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mt: 2, width: "100%" }}
                    disabled={isSubmitting}
                  />

                  <Button variant="outlined" component="label" sx={{ mt: 2, width: "100%" }} disabled={isSubmitting}>
                    📁 Ajouter vos propres photos {files.length > 0 && `(${files.length})`}
                    <input hidden type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                  </Button>

                  <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSubmit} disabled={isSubmitting || !selectedPlace}>
                    {isSubmitting ? "⏳ Envoi en cours..." : "CRÉER LE SPOT 🚀"}
                  </Button>

                  {submitError && (
                    <Typography color="error" sx={{ mt: 1, fontSize: "0.875rem" }}>
                      ❌ {submitError}
                    </Typography>
                  )}
                </>
              )}
            </Card>
          </Grid>
        </Grid>

        <MapModal
          openIndex={openIndex}
          photos={selectedPlace?.photoUrls ?? []}
          onClose={() => setOpenIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </Box>
    </MapContainer>
  );
}