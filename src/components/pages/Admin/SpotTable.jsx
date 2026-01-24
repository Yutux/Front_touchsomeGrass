import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  Tooltip,
  TableSortLabel,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useNavigate } from "react-router-dom";

const LIST_URL =
  import.meta?.env?.VITE_SPOTS_LIST_URL ||
  "http://localhost:8088/AUTH-SERVICE/api/v1/spots/get/all";

const DELETE_URL = (id) => {
  const tpl =
    import.meta?.env?.VITE_SPOT_DELETE_URL_TEMPLATE ||
    "http://localhost:8088/AUTH-SERVICE/api/v1/spots/delete/{id}";
  return tpl.replace("{id}", id);
};

function normalizeRow(raw) {
  // Champs renvoyés par ton SpotDto
  const latitude =
    raw.latitude ?? raw.lat ?? raw.Latitude ?? raw.Lat ?? raw.latitud ?? null;
  const longitude =
    raw.longitude ?? raw.lon ?? raw.lng ?? raw.Longitude ?? raw.lonx ?? null;

  const imageUrls = Array.isArray(raw.imageUrls) ? raw.imageUrls : [];
  const imagesCount =
    imageUrls.length + (raw.imagePath ? 1 : 0); // 1 pour l'image locale éventuelle

  return {
    id: raw.id ?? raw._id ?? raw.uuid,
    name: raw.name ?? "—",
    description: raw.description ?? "",
    latitude,
    longitude,
    creator: raw.creator ?? "Inconnu",
    imagePath: raw.imagePath ?? null,
    imageUrls,
    imagesCount,
    _raw: raw,
  };
}

function descendingComparator(a, b, orderBy) {
  const va = a?.[orderBy];
  const vb = b?.[orderBy];
  if (vb < va) return -1;
  if (vb > va) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function SpotTable() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });

  // Fetch list (gère 200 + 204 No Content)
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setFetchError("");

    fetch(LIST_URL, { signal: ctrl.signal })
      .then(async (res) => {
        if (res.status === 204) {
          // No Content → liste vide
          return { spots: [] };
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Ton contrôleur renvoie { message, spots: [...] }
        const list = Array.isArray(data?.spots) ? data.spots : [];
        const normalized = list.map(normalizeRow).filter((r) => !!r.id);
        setRows(normalized);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setFetchError(e.message || "Erreur inconnue");
        }
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, []);

  const sortedRows = useMemo(() => {
    return [...rows].sort(getComparator(order, orderBy));
  }, [rows, order, orderBy]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page, rowsPerPage]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleView = (id) => navigate(`/spot/${id}`);
  const handleEdit = (id) => navigate(`/admin/spot/update/${id}`);

  const openDelete = (row) => {
    setToDelete(row);
    setConfirmOpen(true);
  };
  const closeDelete = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setToDelete(null);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(DELETE_URL(toDelete.id), { method: "DELETE" });
      if (!(res.ok || res.status === 204)) throw new Error(`HTTP ${res.status}`);
      setRows((prev) => prev.filter((r) => r.id !== toDelete.id));
      setSnack({
        open: true,
        msg: `“${toDelete.name}” supprimé.`,
        severity: "success",
      });
      closeDelete();
    } catch (e) {
      setSnack({
        open: true,
        msg: `Suppression impossible : ${e.message || "erreur inconnue"}`,
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const resetSortPaginate = () => {
    setOrder("asc");
    setOrderBy("name");
    setPage(0);
    setRowsPerPage(10);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Gestion des Spots</Typography>
        <Tooltip title="Réinitialiser tri/pagination">
          <Button
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={resetSortPaginate}
            variant="outlined"
          >
            Réinitialiser
          </Button>
        </Tooltip>
      </Box>

      {/* Loading / Error / Empty states */}
      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : fetchError ? (
        <Alert severity="error">Erreur de chargement : {fetchError}</Alert>
      ) : rows.length === 0 ? (
        <Alert severity="info">Aucun spot pour le moment.</Alert>
      ) : (
        <>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === "name" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    <strong>Nom</strong>
                  </TableSortLabel>
                </TableCell>

                <TableCell>
                  <strong>Créateur</strong>
                </TableCell>

                <TableCell sortDirection={orderBy === "latitude" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "latitude"}
                    direction={orderBy === "latitude" ? order : "asc"}
                    onClick={() => handleRequestSort("latitude")}
                  >
                    <strong>Latitude</strong>
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === "longitude" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "longitude"}
                    direction={orderBy === "longitude" ? order : "asc"}
                    onClick={() => handleRequestSort("longitude")}
                  >
                    <strong>Longitude</strong>
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === "imagesCount" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "imagesCount"}
                    direction={orderBy === "imagesCount" ? order : "asc"}
                    onClick={() => handleRequestSort("imagesCount")}
                  >
                    <strong>Images</strong>
                  </TableSortLabel>
                </TableCell>

                <TableCell align="right">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pagedRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{row.name}</Typography>
                      {row.description ? (
                        <Tooltip title={row.description}>
                          <Chip size="small" label="i" variant="outlined" />
                        </Tooltip>
                      ) : null}
                    </Box>
                  </TableCell>

                  <TableCell>{row.creator}</TableCell>
                  <TableCell>{row.latitude ?? "—"}</TableCell>
                  <TableCell>{row.longitude ?? "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.imagesCount} />
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Voir">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleView(row.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Éditer">
                      <IconButton
                        color="warning"
                        size="small"
                        onClick={() => handleEdit(row.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => openDelete(row)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page"
          />
        </>
      )}

      {/* Confirm delete dialog */}
      <Dialog open={confirmOpen} onClose={closeDelete} fullWidth maxWidth="xs">
        <DialogTitle>Supprimer ce spot ?</DialogTitle>
        <DialogContent dividers>
          {toDelete ? (
            <Typography>
              Cette action est irréversible. Confirmer la suppression de{" "}
              <strong>{toDelete.name}</strong> ?
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete} disabled={deleting}>
            Annuler
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
