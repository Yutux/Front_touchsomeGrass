import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  IconButton,
} from "@mui/material";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CommentSection from "../../Comments/CommentSection";

const API_URL = "http://localhost:8088/api/v1/spots/get";

export default function SpotDetails() {
  const { id } = useParams();
  const [spot, setSpot] = useState(null);
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
        if (!data.newSpot) throw new Error("Spot non trouvé");
        setSpot(data);
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

  if (!spot) return null;

  const images = [
    ...(spot.newSpot.imageUrls || []),
    ...(spot.newSpot.imagePath ? [`http://localhost:8088/api/v1/uploads/${spot.newSpot.imagePath}`] : []),
  ];

  const handleNextImage = () =>
    setCurrentImage((prev) => (prev + 1) % images.length);
  const handlePrevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

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
          mb: 2,
          gap: 2
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {spot.newSpot.name}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Créé par : {spot.creatorname || "Inconnu"}
          </Typography>
        </Box>

        {/* 🔥 BOUTON FAVORIS - À côté du titre */}
        <FavoriteButton 
          spotId={id} 
          type="spot"
          size="large"
          color="error"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 🖼️ Galerie d'images */}
      {images.length > 0 ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "400px",
            borderRadius: 2,
            overflow: "hidden",
            mb: 3,
          }}
        >
          <Card>
            <CardMedia
              component="img"
              src={images[currentImage]}
              alt={spot.newSpot.name}
              sx={{
                height: 400,
                objectFit: "cover",
              }}
              onError={(e) => {
                if (e.target && e.target instanceof HTMLImageElement) {
                  e.target.src = "/images/no-image.png";
                }
              }}
            />
          </Card>

          {/* Flèches navigation */}
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
      ) : (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Aucune image disponible pour ce spot.
        </Typography>
      )}

      {/* 📖 Description */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🏞️ Description
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {spot.newSpot.description}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Latitude :</strong> {spot.newSpot.latitude}
          </Typography>
          <Typography variant="body2">
            <strong>Longitude :</strong> {spot.newSpot.longitude}
          </Typography>
        </Box>
      </Paper>

      {/* 🗺️ Carte Google */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🗺️ Localisation
        </Typography>

        <LoadScript googleMapsApiKey="ApiKeyHere">
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "300px",
              borderRadius: "10px",
            }}
            center={{
              lat: Number(spot.newSpot.latitude),
              lng: Number(spot.newSpot.longitude),
            }}
            zoom={12}
          >
            <Marker
              position={{
                lat: Number(spot.newSpot.latitude),
                lng: Number(spot.newSpot.longitude),
              }}
            />
          </GoogleMap>
        </LoadScript>
      </Paper>

      {/* ℹ️ Informations supplémentaires */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          ℹ️ Informations supplémentaires
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ce spot fait partie des zones d'exploration recensées dans notre base
          de données. Vous pourrez bientôt visualiser les points GPS exacts sur
          la carte interactive.
        </Typography>
      </Paper>

      {/* 💬 Section commentaires */}
      <CommentSection spotId={id} type="spot" />
    </Box>
  );
}