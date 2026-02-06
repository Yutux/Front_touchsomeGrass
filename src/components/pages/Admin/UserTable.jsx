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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import request from "../../utils/request";

const ROLE_COLORS = {
  ROLE_USER: "primary",
  ROLE_ADMIN: "error",
  ROLE_MODERATOR: "warning",
};

const ROLE_LABELS = {
  ROLE_USER: "Utilisateur",
  ROLE_ADMIN: "Admin",
  ROLE_MODERATOR: "Modérateur",
};

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const navigate = useNavigate();

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Recherche
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog pour éditer les rôles
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Charger les utilisateurs
  useEffect(() => {
    request(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/users`, "GET", {}, true)
      .then((response) => {
        console.log("✅ Réponse utilisateurs :", response.data);
        
        // ✅ S'assurer que c'est toujours un tableau
        let userList = [];
        
        if (Array.isArray(response.data)) {
          // Format : [user1, user2, ...]
          userList = response.data;
        } else if (Array.isArray(response.data?.userList)) {
          // Format : { userList: [user1, user2, ...] } ✅ VOTRE FORMAT
          userList = response.data.userList;
        } else if (Array.isArray(response.data?.users)) {
          // Format : { users: [user1, user2, ...] }
          userList = response.data.users;
        } else if (Array.isArray(response.data?.data)) {
          // Format : { data: [user1, user2, ...] }
          userList = response.data.data;
        } else if (response.data && typeof response.data === 'object' && response.data.id) {
          // Format : UN SEUL utilisateur { id: 1, firstname: "...", ... }
          userList = [response.data];
        }

        console.log("📋 Utilisateurs parsés :", userList);
        setUsers(userList);
        setFilteredUsers(userList);
      })
      .catch((error) => {
        console.error("❌ Erreur lors du chargement :", error);
        setSnack({ open: true, msg: "Erreur de chargement", sev: "error" });
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtrer les résultats selon la recherche
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredUsers(users);
      setPage(0);
      return;
    }

    const filtered = users.filter((user) => {
      return (
        user.firstname?.toLowerCase().includes(query) ||
        user.lastname?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.roles?.some((role) =>
          role.roleName?.toLowerCase().includes(query)
        )
      );
    });

    setFilteredUsers(filtered);
    setPage(0);
  }, [searchQuery, users]);

  // Supprimer un utilisateur
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?"))
      return;

    try {
      const response = await request(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/delete/${id}`,
        "DELETE",
        null,
        true
      );

      if (response.status === 200) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setSnack({
          open: true,
          msg: "✅ Utilisateur supprimé",
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

  // Ouvrir le dialog d'édition des rôles
  const handleEditRoles = (user) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles?.map((r) => r.id) || []);
    setEditDialogOpen(true);
  };

  // Sauvegarder les nouveaux rôles
  const handleSaveRoles = async () => {
    try {
      const response = await request(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/users/${selectedUser.id}/roles`,
        "PUT",
        { roleIds: selectedRoles },
        true
      );

      if (response.status === 200) {
        // Mettre à jour localement
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  roles: selectedRoles.map((roleId) => ({
                    id: roleId,
                    roleName:
                      roleId === 1
                        ? "ROLE_USER"
                        : roleId === 2
                        ? "ROLE_ADMIN"
                        : "ROLE_MODERATOR",
                  })),
                }
              : u
          )
        );

        setSnack({
          open: true,
          msg: "✅ Rôles mis à jour",
          sev: "success",
        });
        setEditDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        msg: "❌ Erreur lors de la mise à jour",
        sev: "error",
      });
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculer les données paginées
  const paginatedUsers = Array.isArray(filteredUsers)
    ? filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      )
    : [];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={40} />
        <Typography ml={2}>Chargement des utilisateurs...</Typography>
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
          Gestion des utilisateurs
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
          {filteredUsers.length === users.length
            ? `${users.length} utilisateur(s) au total`
            : `${filteredUsers.length} résultat(s) sur ${users.length} utilisateur(s)`}
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
              <strong>Email</strong>
            </TableCell>
            <TableCell>
              <strong>Rôles</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  {searchQuery
                    ? "Aucun résultat trouvé pour votre recherche"
                    : "Aucun utilisateur trouvé."}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedUsers.map((user) => (
              <TableRow
                key={user.id}
                hover
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell>
                  {user.firstname} {user.lastname}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {user.roles?.map((role) => (
                      <Chip
                        key={role.id}
                        label={ROLE_LABELS[role.roleName] || role.roleName}
                        color={ROLE_COLORS[role.roleName] || "default"}
                        size="small"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Voir">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => navigate(`/user/${user.id}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Éditer rôles">
                    <IconButton
                      color="warning"
                      size="small"
                      onClick={() => handleEditRoles(user)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(user.id)}
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
        count={filteredUsers.length}
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

      {/* Dialog pour éditer les rôles */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Modifier les rôles de {selectedUser?.firstname}{" "}
          {selectedUser?.lastname}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Rôles</InputLabel>
            <Select
              multiple
              value={selectedRoles}
              onChange={(e) => setSelectedRoles(e.target.value)}
              input={<OutlinedInput label="Rôles" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((roleId) => {
                    const roleName =
                      roleId === 1
                        ? "ROLE_USER"
                        : roleId === 2
                        ? "ROLE_ADMIN"
                        : "ROLE_MODERATOR";
                    return (
                      <Chip
                        key={roleId}
                        label={ROLE_LABELS[roleName]}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              <MenuItem value={1}>Utilisateur</MenuItem>
              <MenuItem value={2}>Admin</MenuItem>
              <MenuItem value={3}>Modérateur</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleSaveRoles}
            variant="contained"
            disabled={selectedRoles.length === 0}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

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