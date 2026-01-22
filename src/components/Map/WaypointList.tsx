/**
 * 📍 WaypointList.tsx
 * Liste des points (waypoints) du parcours avec options :
 * - ajout via Autocomplete
 * - centrage sur la carte
 * - suppression d’un point
 */

import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Stack,
  Box,
  IconButton,
  Chip,
  Tooltip,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import { Autocomplete } from "@react-google-maps/api";
import { Waypoint } from "../../hooks/useDirections";

interface Props {
  waypoints: Waypoint[];
  addWaypoint: (wp: Waypoint) => void;
  removeWaypoint: (index: number) => void;
  focusWaypoint: (wp: Waypoint) => void;
  autoRef: google.maps.places.Autocomplete | null;
  setAutoRef: React.Dispatch<React.SetStateAction<google.maps.places.Autocomplete | null>>;
}

export default function WaypointList({
  waypoints,
  addWaypoint,
  removeWaypoint,
  focusWaypoint,
  autoRef,
  setAutoRef,
}: Props) {
  return (
    <Accordion defaultExpanded disableGutters sx={{ borderRadius: 2, overflow: "hidden" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={700}>📌 Points du parcours</Typography>
      </AccordionSummary>

      <AccordionDetails>
        {/* Autocomplete Google Maps */}
        <Box sx={{ mb: 2 }}>
          <Autocomplete
            onLoad={(ref) => setAutoRef(ref)}
            onPlaceChanged={() => {
              const place = autoRef?.getPlace();
              if (!place || !place.geometry?.location) return;
              addWaypoint({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                name: place.name || "Lieu",
                place_id: place.place_id,
                address: place.formatted_address,
              });
            }}
          >
            <TextField size="small" fullWidth placeholder="Rechercher un lieu" />
          </Autocomplete>
        </Box>

        {/* Liste des waypoints */}
        {waypoints.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Ajoute au moins 2 points pour créer un itinéraire.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {waypoints.map((wp, i) => (
              <Paper
                key={`${wp.lat}-${wp.lng}-${i}`}
                variant="outlined"
                sx={{
                  p: 1,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Chip size="small" label={i + 1} color="primary" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={600} noWrap title={wp.name}>
                    {wp.name}
                  </Typography>
                  {wp.address && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      title={wp.address}
                    >
                      {wp.address}
                    </Typography>
                  )}
                </Box>

                <Tooltip title="Centrer">
                  <IconButton size="small" onClick={() => focusWaypoint(wp)}>
                    <CenterFocusStrongIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Supprimer">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeWaypoint(i)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>
            ))}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
