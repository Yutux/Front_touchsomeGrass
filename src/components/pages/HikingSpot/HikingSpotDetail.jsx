import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  CardMedia,
} from "@mui/material";
import { GoogleMap, Marker, Polyline, LoadScript } from "@react-google-maps/api";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CommentSection from "../../Comments/CommentSection";
import FavoriteButton from "../../UI/FavoriteButton";

const API_URL = "http://localhost:8088/api/v1/hikingspot/get";

export default function HikingSpotDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`${API_URL}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        if (!data.newHikingSpot) throw new Error("HikingSpot non trouvé");
        setData(data);
      })
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ mt: 4, maxWidth: 700, margin: "0 auto" }}>
        {error}
      </Alert>
    );

  const hikingSpot = data.newHikingSpot;

  console.log("HikingSpot data:", hikingSpot);
  const creatorName = data.name || "Inconnu";

  // 🖼️ Fusionne les images du backend
  const images = [
    ...(hikingSpot.imageUrls || []),
    ...(hikingSpot.imagePath
      ? [`http://localhost:8088/api/v1/uploads/${hikingSpot.imagePath}`]
      : []),
  ];

  const handleNextImage = () =>
    setCurrentImage((prev) => (prev + 1) % images.length);
  const handlePrevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const waypoints = hikingSpot.waypoints || [];

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* 🔥 NOUVEAU HEADER avec bouton favoris */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between', 
          mb: 1,
          gap: 2
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {hikingSpot.name}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Créé par : {creatorName}
          </Typography>
        </Box>

        {/* 🔥 BOUTON FAVORIS - À côté du titre */}
        <FavoriteButton 
          spotId={id} 
          type="hiking"
          size="large"
          color="error"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 🖼️ Galerie d'images */}
      {images.length > 0 && (
        <Box sx={{ position: "relative", mb: 3 }}>
          <CardMedia
            component="img"
            src={images[currentImage]}
            alt={hikingSpot.name}
            sx={{
              height: 400,
              borderRadius: 2,
              objectFit: "cover",
              width: "100%",
            }}
            onError={(e) => {
              if (e.target && e.target instanceof HTMLImageElement) {
                e.target.src = "/images/no-image.png";
              }
            }}
          />
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 10,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </>
          )}
        </Box>
      )}

      {/* 📝 Description */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🏞️ Description
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {hikingSpot.description || "Aucune description disponible."}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Région :</strong> {hikingSpot.region || "Non précisée"}
          </Typography>
          <Typography variant="body2">
            <strong>Distance :</strong> {hikingSpot.distance || "?"} km
          </Typography>
          <Typography variant="body2">
            <strong>Difficulté :</strong>{" "}
            {hikingSpot.difficultyLevel || "Non précisée"}
          </Typography>
        </Box>
      </Paper>

      {/* 🗺️ Carte Google */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🗺️ Parcours
        </Typography>

        <LoadScript googleMapsApiKey="TON_API_KEY_GOOGLE_MAPS">
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "350px",
              borderRadius: "10px",
            }}
            center={{
              lat: Number(hikingSpot.startLatitude),
              lng: Number(hikingSpot.startLongitude),
            }}
            zoom={12}
          >
            {/* Départ */}
            <Marker
              position={{
                lat: Number(hikingSpot.startLatitude),
                lng: Number(hikingSpot.startLongitude),
              }}
              label="Départ"
            />
            {/* Arrivée */}
            <Marker
              position={{
                lat: Number(hikingSpot.endLatitude),
                lng: Number(hikingSpot.endLongitude),
              }}
              label="Arrivée"
            />
            {/* Escales */}
            {waypoints.map((w, i) => (
              <Marker
                key={i}
                position={{ lat: Number(w.lat), lng: Number(w.lng) }}
                label={w.name || `Escale ${i + 1}`}
              />
            ))}
            {/* Ligne du trajet */}
            <Polyline
              path={[
                { lat: Number(hikingSpot.startLatitude), lng: Number(hikingSpot.startLongitude) },
                ...waypoints.map((w) => ({
                  lat: Number(w.lat),
                  lng: Number(w.lng),
                })),
                { lat: Number(hikingSpot.endLatitude), lng: Number(hikingSpot.endLongitude) },
              ]}
              options={{
                strokeColor: "#0080ff",
                strokeOpacity: 0.8,
                strokeWeight: 4,
              }}
            />
          </GoogleMap>
        </LoadScript>
      </Paper>

      {/* 💬 Section commentaires */}
      <CommentSection spotId={id} type="hiking" />
    </Box>
  );
}