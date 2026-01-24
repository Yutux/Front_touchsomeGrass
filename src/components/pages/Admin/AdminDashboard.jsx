import { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PlaceIcon from "@mui/icons-material/Place";
import TerrainIcon from "@mui/icons-material/Terrain";

import UserTable from "./UserTable";
import SpotTable from "./SpotTable";
import HikingSpotTable from "./HikingSpotTable";

export default function AdminDashboard() {
  const [view, setView] = useState("users");

  const handleChangeView = (event, newView) => {
    if (newView !== null) setView(newView);
  };

  const stats = [
    { label: "Utilisateurs actifs", value: 128 },
    { label: "Spots créés", value: 42 },
    { label: "Hiking Spots", value: 17 },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f5f5f5",
          p: 4,
          minHeight: "100vh",
          ml: "70px",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Tableau de bord Admin
        </Typography>

        {/* 🧾 Statistiques */}
        <Grid container spacing={2} mb={4}>
          {stats.map((s, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: "white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {s.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 🔘 Boutons de bascule */}
        <Box display="flex" justifyContent="center" mb={3}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleChangeView}
            color="primary"
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <ToggleButton value="users">
              <PeopleIcon sx={{ mr: 1 }} /> Utilisateurs
            </ToggleButton>
            <ToggleButton value="spots">
              <PlaceIcon sx={{ mr: 1 }} /> Spots
            </ToggleButton>
            <ToggleButton value="hikingSpots">
              <TerrainIcon sx={{ mr: 1 }} /> Hiking Spots
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 🧩 Contenu dynamique */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          {view === "users" && <UserTable />}
          {view === "spots" && <SpotTable />}
          {view === "hikingSpots" && <HikingSpotTable />}
        </Paper>
      </Box>
    </Box>
  );
}
