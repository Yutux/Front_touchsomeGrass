import { useEffect, useState } from "react";
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
  TablePagination,
  Paper,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import request from "../../utils/request";

export default function HikingSpotTable() {
  const [hikingSpots, setHikingSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const navigate = useNavigate();

  // 🔹 Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔍 Recherche
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Charger les HikingSpots depuis ton backend
  useEffect(() => {
    request(
      `${import.meta.env.VITE_API_BASE_URL}/v1/hikingspot/get/all`,
      "GET",
      {},
      false
    )
      .then((response) => {
        console.log("✅ Réponse HikingSpots :", response.data);
        const spots =
          response.data?.HikingSpots || response.data?.hikingSpots || [];

        setHikingSpots(spots);
        setFilteredSpots(spots);
      })
      .catch((error) => {
        console.error("❌ Erreur lors du chargement :", error);
        setSnack({ open: true, msg: "Erreur de chargement", sev: "error" });
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔍 Filtrer les résultats selon la recherche
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredSpots(hikingSpots);
      setPage(0); // Reset à la première page
      return;
    }

    const filtered = hikingSpots.filter((hs) => {
      return (
        hs.name?.toLowerCase().includes(query) ||
        hs.region?.toLowerCase().includes(query) ||
        hs.creatorName?.toLowerCase().includes(query) ||
        hs.difficultyLevel?.toLowerCase().includes(query)
      );
    });

    setFilteredSpots(filtered);
    setPage(0); // Reset à la première page après recherche
  }, [searchQuery, hikingSpots]);

  // 🗑️ Supprimer un HikingSpot
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce HikingSpot ?"))
      return;

    try {
      const response = await request(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/hikingspot/delete/${id}`,
        "DELETE",
        null,
        true
      );

      if (response.status === 200) {
        setHikingSpots((prev) => prev.filter((s) => s.id !== id));
        setSnack({
          open: true,
          msg: "✅ HikingSpot supprimé",
          sev: "success",
        });
      } else {
        throw new Error("Erreur de suppression");
      }
    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        msg: "❌ Erreur lors de la suppression",
        sev: "error",
      });
    }
  };

  // 📄 Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 📊 Calculer les données paginées
  const paginatedSpots = filteredSpots.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={40} />
        <Typography ml={2}>Chargement des Hiking Spots...</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {/* Header avec recherche */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={600}>
          Gestion des Hiking Spots
        </Typography>

        <TextField
          size="small"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Stats */}
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          {filteredSpots.length === hikingSpots.length
            ? `${hikingSpots.length} hiking spot(s) au total`
            : `${filteredSpots.length} résultat(s) sur ${hikingSpots.length} hiking spot(s)`}
        </Typography>
      </Box>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "grey.100" }}>
            <TableCell>
              <strong>Nom</strong>
            </TableCell>
            <TableCell>
              <strong>Région</strong>
            </TableCell>
            <TableCell>
              <strong>Créateur</strong>
            </TableCell>
            <TableCell>
              <strong>Difficulté</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedSpots.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  {searchQuery
                    ? "Aucun résultat trouvé pour votre recherche"
                    : "Aucun HikingSpot trouvé."}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedSpots.map((hs) => (
              <TableRow
                key={hs.id}
                hover
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  transition: "background-color 0.2s",
                }}
              >
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
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Éditer">
                    <IconButton
                      color="warning"
                      size="small"
                      onClick={() =>
                        navigate(`/admin/hikingspot/update/${hs.id}`)
                      }
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(hs.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredSpots.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
        }
        sx={{
          borderTop: 1,
          borderColor: "divider",
          mt: 2,
        }}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.sev}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}