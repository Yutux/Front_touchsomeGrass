/**
 * 🧭 RouteForm.tsx
 * Formulaire d’informations générales pour la création d’une randonnée :
 * - Nom
 * - Description
 * - Région
 * - Difficulté
 */

import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface SpotData {
  name: string;
  description: string;
  region: string;
  difficultyLevel: number;
}

interface Props {
  spotData: SpotData;
  setSpotData: React.Dispatch<React.SetStateAction<SpotData>>;
}

export default function RouteForm({ spotData, setSpotData }: Props) {
  return (
    <Accordion disableGutters defaultExpanded sx={{ borderRadius: 2, overflow: "hidden" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={700}>🧭 Infos du parcours</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={1.5}>
          {/* 🏷️ Nom */}
          <TextField
            size="small"
            label="Nom"
            value={spotData.name}
            onChange={(e) => setSpotData({ ...spotData, name: e.target.value })}
            fullWidth
          />

          {/* 📝 Description */}
          <TextField
            size="small"
            label="Description"
            value={spotData.description}
            onChange={(e) => setSpotData({ ...spotData, description: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />

          {/* 📍 Région */}
          <TextField
            size="small"
            label="Région"
            value={spotData.region}
            onChange={(e) => setSpotData({ ...spotData, region: e.target.value })}
            fullWidth
          />

          {/* ⚡ Niveau de difficulté */}
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
  );
}
