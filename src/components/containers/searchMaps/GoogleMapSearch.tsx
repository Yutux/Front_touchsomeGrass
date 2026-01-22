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
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { motion, AnimatePresence } from "framer-motion";

interface PlaceData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  photoReferences?: string[]; // 🔥 Pour le backend
  photoUrls?: string[]; // 🔥 Pour l'aperçu uniquement
}

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

          // 🔥 Extraire photo_reference depuis les URLs
          if (details.photos && details.photos.length > 0) {
            console.log("📸 Nombre de photos trouvées:", details.photos.length);
            
            details.photos.forEach((photo: any, index: number) => {
              try {
                // Générer l'URL complète
                const url = photo.getUrl({ maxWidth: 1200 });
                console.log(`  🔗 Photo ${index + 1} URL:`, url.substring(0, 120) + "...");
                
                // Extraire le photoreference depuis l'URL
                // Format: ...photoreference=XXXXX&...
                const match = url.match(/[?&]1s([^&]+)/);
                
                if (match && match[1]) {
                  const photoRef = match[1];
                  photoReferences.push(photoRef);
                  console.log(`  ✅ Photo reference extraite:`, photoRef.substring(0, 50) + "...");
                } else {
                  console.warn(`  ⚠️ Photo ${index + 1}: impossible d'extraire la reference de l'URL`);
                }
                
                // Stocker l'URL pour l'aperçu
                photoUrls.push(url);
                
              } catch (error) {
                console.error(`  ❌ Erreur photo ${index + 1}:`, error);
              }
            });
            
            console.log(`  📊 Résultat: ${photoReferences.length}/${details.photos.length} photo references extraites`);
          } else {
            console.log("⚠️ Aucune photo disponible pour ce lieu");
          }

          const placeData: PlaceData = {
            name: details.name || "Lieu inconnu",
            address: details.formatted_address || "Adresse non disponible",
            latitude: lat,
            longitude: lng,
            rating: details.rating,
            photoReferences, // 🔥 Pour envoyer au backend
            photoUrls, // 🔥 Pour afficher dans l'interface
          };

          console.log("📍 Lieu sélectionné:", placeData.name);
          console.log("🖼️ Photo references:", photoReferences.length);

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
      if (place.place_id) {
        console.log("🔍 Recherche d'un lieu:", place.name);
        fetchPlaceDetails(place.place_id);
      }
    }
  };

  // ✅ Géocoder les clics manuels
  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const address = results[0].formatted_address;
        const placeData: PlaceData = {
          name: "Lieu choisi manuellement",
          address,
          latitude: lat,
          longitude: lng,
          photoReferences: [],
          photoUrls: [],
        };
        console.log("📍 Lieu manuel:", address);
        setSelectedPlace(placeData);
        onPlaceSelected(placeData);
      } else {
        setSelectedPlace({
          name: "Lieu choisi manuellement",
          address: `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`,
          latitude: lat,
          longitude: lng,
          photoReferences: [],
          photoUrls: [],
        });
      }
    });
  };

  // ✅ Clic sur la carte
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (!lat || !lng || !mapRef.current) return;

    setMarkerPosition({ lat, lng });
    reverseGeocode(lat, lng);
  };

  // ✅ Support des clics sur lieux natifs Google Maps
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    map.addListener("click", (e: any) => {
      if (e.placeId) {
        e.stop(); // Empêche l'infobulle Google
        console.log("🗺️ Clic sur un POI Google Maps");
        fetchPlaceDetails(e.placeId);
      } else {
        handleMapClick(e);
      }
    });
  };

  // ✅ Envoi au backend avec photo_reference
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

      console.log("\n=== 📤 ENVOI AU BACKEND ===");
      console.log("📍 Lieu:", selectedPlace.name);
      console.log("🖼️ Photo references à envoyer:", selectedPlace.photoReferences?.length || 0);
      console.log("📁 Fichiers à envoyer:", files.length);

      const formData = new FormData();
      
      const spotData = {
        name: selectedPlace.name,
        description,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        imagePath: "",
        imageUrls: selectedPlace.photoReferences || [], // 🔥 Envoyer les photo_reference
        creator: null,
      };
      
      // Afficher les photo_reference envoyées
      if (selectedPlace.photoReferences && selectedPlace.photoReferences.length > 0) {
        console.log("📸 Photo references:");
        selectedPlace.photoReferences.forEach((ref, i) => {
          console.log(`  ${i + 1}. ${ref.substring(0, 50)}...`);
        });
      }
      
      formData.append("spot", new Blob([JSON.stringify(spotData)], { type: "application/json" }));
      
      // Ajouter les fichiers uploadés manuellement
      files.forEach((file, index) => {
        formData.append("files", file);
        console.log(`📁 Fichier ${index + 1}:`, file.name, `(${file.size} bytes)`);
      });

      const headers: Record<string, string> = {
        "Authorization": `Bearer ${token}`,
      };

      console.log("🚀 Envoi en cours...");

      const response = await fetch("http://localhost:8088/AUTH-SERVICE/api/v1/spots/create", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("❌ Erreur serveur:", errText);
        throw new Error(errText);
      }

      const result = await response.json();
      console.log("✅ Réponse backend:", result);
      console.log("========================\n");

      alert(`✅ Spot créé avec succès !\n${result.message}`);
      
      // Réinitialiser le formulaire
      setSelectedPlace(null);
      setMarkerPosition(null);
      setDescription("");
      setFiles([]);

    } catch (error: any) {
      console.error("❌ Erreur:", error);
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

  const modalContent = (
    <AnimatePresence mode="wait">
      {openIndex !== null && selectedPlace?.photoUrls && (
        <motion.div
          key={selectedPlace.photoUrls[openIndex]}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Box sx={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", outline: "none" }}>
            <IconButton
              onClick={() => setOpenIndex(null)}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                color: "white",
                backgroundColor: "rgba(0,0,0,0.5)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                zIndex: 2,
              }}
            >
              <CloseIcon />
            </IconButton>

            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                top: "50%",
                left: 10,
                transform: "translateY(-50%)",
                color: "white",
                backgroundColor: "rgba(0,0,0,0.5)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                zIndex: 2,
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>

            <motion.img
              key={selectedPlace.photoUrls[openIndex]}
              src={selectedPlace.photoUrls[openIndex]}
              alt="Aperçu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: "10px",
                boxShadow: "0 4px 30px rgba(0,0,0,0.6)",
              }}
            />

            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                top: "50%",
                right: 10,
                transform: "translateY(-50%)",
                color: "white",
                backgroundColor: "rgba(0,0,0,0.5)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                zIndex: 2,
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <LoadScript googleMapsApiKey={GOOGLE_API_KEY} libraries={["places"]}>
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
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    📍 Latitude : {selectedPlace.latitude.toFixed(4)}
                  </Typography>
                  <Typography variant="body2">
                    📍 Longitude : {selectedPlace.longitude.toFixed(4)}
                  </Typography>

                  {selectedPlace.rating && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      ⭐ Note : {selectedPlace.rating}
                    </Typography>
                  )}

                  {/* Aperçu des photos Google Maps */}
                  {selectedPlace.photoUrls && selectedPlace.photoUrls.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
                        📸 Photos Google Maps ({selectedPlace.photoUrls.length})
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1 }}>
                        {selectedPlace.photoUrls.slice(0, 6).map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            style={{
                              width: "100%",
                              borderRadius: "8px",
                              height: "100px",
                              objectFit: "cover",
                              cursor: "pointer",
                              transition: "0.3s",
                              border: "2px solid #e0e0e0",
                            }}
                            onClick={() => setOpenIndex(index)}
                          />
                        ))}
                      </Box>
                    </>
                  )}

                  {/* 📝 Formulaire */}
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
                    <input
                      hidden
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    />
                  </Button>

                  {/* Liste des fichiers ajoutés */}
                  {files.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {files.map((file, idx) => (
                        <Box 
                          key={idx} 
                          sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            p: 0.5,
                            backgroundColor: "#f0f0f0",
                            borderRadius: 1,
                            mb: 0.5
                          }}
                        >
                          <Typography variant="caption" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                            📎 {file.name}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                            disabled={isSubmitting}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* 📊 Récapitulatif */}
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: "#e3f2fd", 
                      borderRadius: 2,
                      border: "1px solid #2196f3"
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                      📋 Récapitulatif
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      📍 Lieu : {selectedPlace.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      🖼️ Photos Google : {selectedPlace.photoReferences?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      📁 Vos photos : {files.length}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: "bold", color: "primary.main" }}>
                      📊 Total : {(selectedPlace.photoReferences?.length || 0) + files.length} image(s)
                    </Typography>
                  </Box>

                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{ mt: 2 }} 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedPlace}
                  >
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

        {/* 🖼️ Modal d'aperçu */}
        <AnimatePresence>
          {openIndex !== null && (
            <Modal
              open
              onClose={() => setOpenIndex(null)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(6px)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {modalContent}
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>
      </Box>
    </LoadScript>
  );
}