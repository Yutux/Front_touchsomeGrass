import React from "react";
import {
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Chip,
} from "@mui/material";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";

import { TravelModeString } from "../../hooks/useDirections";

interface Props {
  travelMode: TravelModeString;
  setTravelMode: React.Dispatch<React.SetStateAction<TravelModeString>>;
  distance: string | null;
  duration: string | null;
}

export default function RouteSummary({
  travelMode,
  setTravelMode,
  distance,
  duration,
}: Props) {
  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        🥾 Créer une randonnée
      </Typography>

      <ToggleButtonGroup
        value={travelMode}
        exclusive
        size="small"
        onChange={(_, val) => val && setTravelMode(val as TravelModeString)}
        sx={{
          "& .MuiToggleButton-root": {
            p: 0.5,
            minWidth: 36,
            transition: "all 0.2s ease",
          },
          "& .Mui-selected": {
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": { backgroundColor: "primary.dark" },
          },
        }}
      >
        <ToggleButton value="WALKING" aria-label="Marche" title="Marche">
          <DirectionsWalkIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="DRIVING" aria-label="Voiture" title="Voiture">
          <DirectionsCarIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="BICYCLING" aria-label="Vélo" title="Vélo">
          <DirectionsBikeIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="TRANSIT" aria-label="Transport" title="Transport">
          <DirectionsBusIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      {(distance || duration) && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {distance && <Chip size="small" label={`Distance : ${distance}`} />}
          {duration && <Chip size="small" label={`Durée : ${duration}`} />}
        </Stack>
      )}
    </Paper>
  );
}
