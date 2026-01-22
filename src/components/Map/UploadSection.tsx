/**
 * 🖼️ UploadSection.tsx
 * Section d’upload et de prévisualisation d’images pour la création d’un parcours.
 * Gère :
 * - la sélection de plusieurs fichiers
 * - l’aperçu dynamique des images
 */

import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props {
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function UploadSection({ selectedFiles, setSelectedFiles }: Props) {
  return (
    <Accordion disableGutters sx={{ borderRadius: 2, overflow: "hidden" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={700}>🖼️ Images</Typography>
      </AccordionSummary>

      <AccordionDetails>
        {/* Bouton d’upload */}
        <Button
          variant="outlined"
          component="label"
          fullWidth
        >
          Sélectionner des fichiers
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
          />
        </Button>

        {/* Aperçu des fichiers sélectionnés */}
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
  );
}
