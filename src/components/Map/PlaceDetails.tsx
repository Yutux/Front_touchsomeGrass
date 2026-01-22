import React from "react";
import { Box, Button, Card, Divider, IconButton, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PlaceData} from "../../types/place";

type Props = {
  selectedPlace: PlaceData | null;
  description: string;
  onDescriptionChange: (v: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
  photoSection?: React.ReactNode; // rendu injecté (PhotoGrid)
};

export default function PlaceDetails({
  selectedPlace,
  description,
  onDescriptionChange,
  files,
  onFilesChange,
  isSubmitting,
  submitError,
  onSubmit,
  photoSection,
}: Props) {
  if (!selectedPlace) {
    return (
      <Card sx={{ height: "100%", overflowY: "auto", p: 2, boxShadow: 4, borderRadius: 3 }}>
        <Typography variant="body1" color="text.secondary" textAlign="center" mt={20}>
          🗺️ Cliquez sur la carte ou recherchez un lieu
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", overflowY: "auto", p: 2, boxShadow: 4, borderRadius: 3 }}>
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
      <Typography variant="body2">📍 Longitude : {selectedPlace.longitude.toFixed(4)}</Typography>

      {selectedPlace.rating && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          ⭐ Note : {selectedPlace.rating}
        </Typography>
      )}

      {/* Photos Google (injection depuis le parent) */}
      {photoSection}

      {/* Formulaire */}
      <TextField
        label="Description"
        multiline
        minRows={3}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
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
          onChange={(e) => onFilesChange(Array.from(e.target.files || []))}
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
                mb: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                📎 {file.name}
              </Typography>
              <IconButton size="small" onClick={() => onFilesChange(files.filter((_, i) => i !== idx))} disabled={isSubmitting}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Récapitulatif */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2, border: "1px solid #2196f3" }}>
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
        onClick={onSubmit}
        disabled={isSubmitting || !selectedPlace}
      >
        {isSubmitting ? "⏳ Envoi en cours..." : "CRÉER LE SPOT 🚀"}
      </Button>

      {submitError && (
        <Typography color="error" sx={{ mt: 1, fontSize: "0.875rem" }}>
          ❌ {submitError}
        </Typography>
      )}
    </Card>
  );
}
