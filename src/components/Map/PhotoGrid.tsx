/**
 * 🖼️ PhotoGrid.tsx
 * Affiche une grille responsive d’images Google Maps
 * avec support du clic pour ouvrir la modale.
 */
import { Box, Typography } from "@mui/material";

interface Props {
  photos: string[];
  onOpen: (index: number) => void;
}

export default function PhotoGrid({ photos, onOpen }: Props) {
  if (!photos || photos.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2, textAlign: "center" }}
      >
        📭 Aucune photo disponible
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, fontWeight: "bold", display: "flex", alignItems: "center" }}
      >
        📸 Photos Google Maps ({photos.length})
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 1,
        }}
      >
        {photos.slice(0, 6).map((photo, index) => (
          <Box
            key={index}
            component="img"
            src={photo}
            alt={`Photo ${index + 1}`}
            onClick={() => onOpen(index)}
            sx={{
              width: "100%",
              height: 100,
              borderRadius: 2,
              objectFit: "cover",
              cursor: "pointer",
              transition: "transform 0.25s, box-shadow 0.25s",
              border: "2px solid #e0e0e0",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 3,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
