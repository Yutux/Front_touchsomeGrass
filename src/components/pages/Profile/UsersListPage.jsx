import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { UserContext } from '../../contexts/UserContext/UserContext';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import AddFriendButton from '../../Social/AddFriendButton';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

export default function UsersListPage() {
  const { token, user: currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Charger tous les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await request(
          'http://localhost:8088/api/v1/auth/users',
          'GET',
          null,
          true
        );

        if (response?.data?.userList) {
          setUsers(response.data.userList);
          setFilteredUsers(response.data.userList);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Filtrer les utilisateurs par recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = users.filter((user) => {
      const fullName = `${user.firstname || ''} ${user.lastname || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      return fullName.includes(searchLower) || email.includes(searchLower);
    });

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const isAdmin = (user) => {
    return user.roles?.some((role) => {
      const roleName = typeof role === 'string' ? role : role.roleName || role.authority;
      return String(roleName).toUpperCase().includes('ADMIN');
    });
  };

  if (!token) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="info">Connectez-vous pour voir les utilisateurs</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          👥 Communauté TouchSomeGrass
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Découvrez et connectez-vous avec d'autres randonneurs
        </Typography>

        {/* Barre de recherche */}
        <TextField
          fullWidth
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Chip
            label={`${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
          {searchQuery && (
            <Chip
              label="Recherche active"
              color="success"
              size="small"
              onDelete={() => setSearchQuery('')}
            />
          )}
        </Stack>
      </Paper>

      {/* Liste des utilisateurs */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery
              ? 'Aucun utilisateur trouvé pour cette recherche'
              : 'Aucun utilisateur disponible'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
              <UserCard
                user={user}
                isCurrentUser={currentUser?.id === user.id}
                isAdmin={isAdmin(user)}
                onViewProfile={handleViewProfile}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

// Composant carte utilisateur
function UserCard({ user, isCurrentUser, isAdmin, onViewProfile }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        border: isCurrentUser ? '2px solid' : '1px solid',
        borderColor: isCurrentUser ? 'primary.main' : 'divider',
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', pb: 1 }}>
        {/* Avatar */}
        <Avatar
          src={user.avatar || DEFAULT_AVATAR}
          alt={`${user.firstname} ${user.lastname}`}
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            border: '3px solid',
            borderColor: isCurrentUser ? 'primary.main' : 'transparent',
          }}
        >
          {user.firstname?.[0]}{user.lastname?.[0]}
        </Avatar>

        {/* Nom */}
        <Typography variant="h6" fontWeight={600} noWrap>
          {user.firstname || ''} {user.lastname || ''}
        </Typography>

        {/* Email */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.email}
        </Typography>

        {/* Badges */}
        <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" sx={{ mb: 1 }}>
          {isCurrentUser && (
            <Chip label="Vous" size="small" color="primary" sx={{ mb: 0.5 }} />
          )}
          {isAdmin && (
            <Chip
              icon={<AdminIcon fontSize="small" />}
              label="Admin"
              size="small"
              color="error"
              sx={{ mb: 0.5 }}
            />
          )}
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Tooltip title="Spots créés">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                {user.spots?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Spots
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Randonnées">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                {user.hikingSpots?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Randos
              </Typography>
            </Box>
          </Tooltip>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Stack spacing={1} sx={{ width: '100%' }}>
          {/* Bouton voir profil */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => onViewProfile(user.id)}
            sx={{ textTransform: 'none' }}
          >
            Voir profil
          </Button>

          {/* Bouton ajouter ami (sauf si c'est soi-même) */}
          {!isCurrentUser && (
            <AddFriendButton
              targetUserId={user.id}
              variant="button"
              size="small"
            />
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}