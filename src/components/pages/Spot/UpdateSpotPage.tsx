import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Modal,
} from "@mui/material";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";

interface Spot {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrls: string[];
  creator: string;
}

const center = { lat: 48.8566, lng: 2.3522 }; // Paris par défaut

// ❗ Pas de .env : on garde tout en dur pour l’instant
const GOOGLE_MAPS_API_KEY = "AIzaSyBHiBCqOdyA356J87JgT3ZWnKR2zr7_Rvs";
const GET_SPOT_URL = (id: string) =>
  `http://localhost:8088/AUTH-SERVICE/api/v1/spots/get/${id}`;
const UPDATE_SPOT_URL = (id: string) =>
  `http://localhost:8088/AUTH-SERVICE/api/v1/spots/update/${id}`;

export default function UpdateSpotPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  mapRef;
  const [searchBoxRef, setSearchBoxRef] = useState<google.maps.places.SearchBox | null>(null);
  // UI State
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "info",
  });

  // 🧭 Récupère le spot existant
  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(GET_SPOT_URL(id || ""), { headers });
        if (!res.ok) throw new Error("Erreur lors du chargement du spot");
        const data = await res.json();

        const s: Spot = data.newSpot || data; // supporte { newSpot } ou direct
        setSpot(s);
        setDescription(s.description || "");
        setExistingImages(Array.isArray(s.imageUrls) ? s.imageUrls : []);
        setMarkerPosition({ lat: s.latitude, lng: s.longitude });
      } catch (err: any) {
        console.error(err);
        setSnackbar({ open: true, message: err?.message || "Erreur de chargement du spot", severity: "error" });
      }
    };
    fetchSpot();
  }, [id]);

  // ✅ Previews des fichiers ajoutés
  useEffect(() => {
    if (files.length === 0) {
      setFilePreviews([]);
      return;
    }
    const readers: FileReader[] = [];
    const urls: string[] = [];
    files.forEach((file) => {
      const r = new FileReader();
      readers.push(r);
      r.onload = () => {
        if (typeof r.result === "string") urls.push(r.result);
        if (urls.length === files.length) setFilePreviews(urls);
      };
      r.readAsDataURL(file);
    });
    return () => readers.forEach((r) => r.abort?.());
  }, [files]);

  // ✅ Supprimer une image existante (avant update) + flag pour le back
  const handleRemoveImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setRemovedImageUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  // ✅ Retirer un fichier local avant envoi
  const handleRemoveLocalFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Recherche via Google Maps
  const handlePlacesChanged = () => {
    if (!searchBoxRef) return;
    const places = searchBoxRef.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
      }
      if (place.name && spot) {
        setSpot({ ...spot, name: place.name });
      }
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (!lat || !lng) return;
    setMarkerPosition({ lat, lng });
  };

  // ✅ Envoi au backend (PUT)
  const handleUpdate = async () => {
    if (!spot) return;

    const spotData = {
      name: spot.name,
      description,
      latitude: markerPosition?.lat ?? spot.latitude,
      longitude: markerPosition?.lng ?? spot.longitude,
      imageUrls: existingImages,   // conservées
      removedImageUrls,            // à supprimer côté back
    };

    const formData = new FormData();
    formData.append("spot", new Blob([JSON.stringify(spotData)], { type: "application/json" }));
    files.forEach((file) => formData.append("files", file));

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(UPDATE_SPOT_URL(id || ""), {
        method: "PUT",
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      setSnackbar({ open: true, message: "✅ Spot mis à jour avec succès", severity: "success" });
      setTimeout(() => navigate("/admin/dashboard"), 1200);
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: `❌ Erreur lors de la mise à jour: ${err?.message || "inconnue"}`, severity: "error" });
    }
  };

  // 🔒 Evite le crash quand Google n’est pas encore chargé
  const dropAnim = (window as any)?.google?.maps?.Animation?.DROP;

  const handlePrev = () => {
    if (openIndex !== null && existingImages.length > 0) {
      setOpenIndex((openIndex - 1 + existingImages.length) % existingImages.length);
    }
  };
  const handleNext = () => {
    if (openIndex !== null && existingImages.length > 0) {
      setOpenIndex((openIndex + 1) % existingImages.length);
    }
  };

  if (!spot) {
    return (
      <Box p={4} textAlign="center">
        <Typography>Chargement du spot...</Typography>
      </Box>
    );
  }

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <Box sx={{ width: "100%", maxWidth: "100%", px: 2, mt: 3 }}>
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
                  <StandaloneSearchBox onLoad={(ref) => setSearchBoxRef(ref)} onPlacesChanged={handlePlacesChanged}>
                    <TextField fullWidth label="Rechercher un lieu" variant="outlined" size="small" />
                  </StandaloneSearchBox>
                </CardContent>
              </Card>

              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={markerPosition || center}
                zoom={14}
                onLoad={(map) => setMapRef(map)}
                onClick={handleMapClick}
              >
                {markerPosition && (
                  <Marker
                    position={markerPosition}
                    animation={dropAnim}
                    draggable
                    onDragEnd={(e) => {
                      const lat = e.latLng?.lat();
                      const lng = e.latLng?.lng();
                      if (lat && lng) setMarkerPosition({ lat, lng });
                    }}
                  />
                )}
              </GoogleMap>
            </Box>
          </Grid>

          {/* ℹ️ Formulaire d’édition */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: "100%", overflowY: "auto", p: 2, boxShadow: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Modifier le spot
              </Typography>
              <Divider sx={{ my: 1 }} />

              <TextField
                fullWidth
                label="Nom"
                value={spot.name}
                onChange={(e) => setSpot({ ...spot, name: e.target.value })}
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                multiline
                minRows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mt: 2 }}
              />

              <Typography variant="body2" sx={{ mt: 2 }}>
                📍 Latitude : {(markerPosition?.lat ?? spot.latitude).toFixed(4)}
              </Typography>
              <Typography variant="body2">
                📍 Longitude : {(markerPosition?.lng ?? spot.longitude).toFixed(4)}
              </Typography>

              {/* 🖼️ Images existantes */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3 }}>
                Images existantes
              </Typography>
              <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 1 }}>
                {existingImages.map((url, i) => (
                  <Box key={i} sx={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={`img-${i}`}
                      onClick={() => setOpenIndex(i)}
                      style={{
                        width: "100%",
                        height: "100px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(url)}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "white",
                        "&:hover": { backgroundColor: "rgba(255,0,0,0.7)" },
                      }}
                      title="Retirer cette image"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              {/* ➕ Ajout nouvelles images */}
              <Button variant="outlined" component="label" sx={{ mt: 2, width: "100%" }}>
                Ajouter des fichiers
                <input
                  hidden
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])}
                />
              </Button>

              {/* 🔍 Previews des nouveaux fichiers + suppression locale */}
              {filePreviews.length > 0 && (
                <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 1 }}>
                  {filePreviews.map((src, idx) => (
                    <Box key={idx} sx={{ position: "relative" }}>
                      <img src={src} alt={`new-${idx}`} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveLocalFile(idx)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          color: "white",
                          "&:hover": { backgroundColor: "rgba(255,0,0,0.7)" },
                        }}
                        title="Retirer ce fichier"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* 💾 Sauvegarde */}
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleUpdate}>
                💾 Mettre à jour le spot
              </Button>
            </Card>
          </Grid>
        </Grid>

        {/* 🖼️ Modal d’image */}
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
                <Box sx={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
                  <IconButton
                    onClick={() => setOpenIndex(null)}
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      color: "white",
                      backgroundColor: "rgba(0,0,0,0.5)",
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
                    }}
                  >
                    <ArrowBackIosNewIcon />
                  </IconButton>

                  <motion.img
                    key={existingImages[openIndex]}
                    src={existingImages[openIndex]}
                    alt="preview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
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
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Box>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>

        {/* ✅ Snackbar de confirmation */}
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </LoadScript>
  );
}
