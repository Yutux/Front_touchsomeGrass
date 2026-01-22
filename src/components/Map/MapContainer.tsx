/**
 * 🗺️ MapContainer.tsx
 * Composant wrapper pour charger l’API Google Maps via `useJsApiLoader`.
 * Fournit un affichage de chargement propre et une gestion d’erreurs.
 */

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useJsApiLoader } from "@react-google-maps/api";

interface Props {
  children: React.ReactNode;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyBHiBCqOdyA356J87JgT3ZWnKR2zr7_Rvs";

export default function MapContainer({ children }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  if (loadError) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          color: "error.main",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6">
          ❌ Erreur lors du chargement de Google Maps
        </Typography>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography>Chargement de la carte…</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
