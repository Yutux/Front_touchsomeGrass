import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import request from "../../utils/request";

export default function HikingSpotTable() {
  const [hikingSpots, setHikingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const navigate = useNavigate();

  // 🔹 Charger les HikingSpots depuis ton backend
  useEffect(() => {
    request(
      "http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/get/all",
      "GET",
      {},
      false
    )
      .then((response) => {
        console.log("✅ Réponse HikingSpots :", response.data);
        // 👇 compatibilité avec les deux formats de réponse
        const spots =
          response.data?.HikingSpots || response.data?.hikingSpots || [];

        setHikingSpots(spots);
      })
      .catch((error) => {
        console.error("❌ Erreur lors du chargement :", error);
        setSnack({ open: true, msg: "Erreur de chargement", sev: "error" });
      })
      .finally(() => setLoading(false));
  }, []);

  // 🗑️ Supprimer un HikingSpot
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce HikingSpot ?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/delete/${id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Erreur de suppression");
      setHikingSpots((prev) => prev.filter((s) => s.id !== id));
      setSnack({ open: true, msg: "✅ HikingSpot supprimé", sev: "success" });
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: "❌ Erreur lors de la suppression", sev: "error" });
    }
  };

  if (loading) {
    return (
      <Typography align="center" mt={4}>
        <CircularProgress size={24} sx={{ mr: 1 }} />
        Chargement des Hiking Spots...
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="h6" mb={2}>
        Gestion des Hiking Spots
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Nom</strong></TableCell>
            <TableCell><strong>Région</strong></TableCell>
            <TableCell><strong>Créateur</strong></TableCell>
            <TableCell><strong>Difficulté</strong></TableCell>
            <TableCell align="right"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {hikingSpots.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Aucun HikingSpot trouvé.
              </TableCell>
            </TableRow>
          ) : (
            hikingSpots.map((hs) => (
              <TableRow key={hs.id}>
                <TableCell>{hs.name}</TableCell>
                <TableCell>{hs.region}</TableCell>
                <TableCell>{hs.creatorName || "Inconnu"}</TableCell>
                <TableCell>{hs.difficultyLevel || "-"}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Voir">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => navigate(`/hikingspot/${hs.id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Éditer">
                    <IconButton
                      color="warning"
                      size="small"
                      onClick={() => navigate(`/admin/hikingspot/update/${hs.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(hs.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.sev}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}
