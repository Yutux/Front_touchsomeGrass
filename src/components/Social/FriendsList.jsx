// src/components/Social/FriendsList.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext/UserContext';
import { Link } from 'react-router-dom';
import request from '../utils/request';
import AddFriendButton from './AddFriendButton';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

/**
 * Liste des amis de l'utilisateur avec recherche
 */
export default function FriendsList() {
  const { token } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await request(
          "http://localhost:8088/api/v1/auth/user",
          "GET",
          null,
          true
        );
        if (res.status === 200 && res.data?.userApp) {
          setUserId(res.data.userApp.id);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchUser();
  }, [token]);

  // Charger les amis
  useEffect(() => {
    if (!userId) return;

    const fetchFriends = async () => {
      setLoading(true);
      try {
        const response = await request(
          `http://localhost:8088/api/v1/user-relations/friends`,
          "GET",
          null,
          true
        );

        if (response?.data?.friends) {
          setFriends(response.data.friends);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des amis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [userId]);

  // Filtrer les amis par recherche
  const filteredFriends = friends.filter((friend) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${friend.firstname || ''} ${friend.lastname || ''}`.toLowerCase();
    const email = (friend.email || '').toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const handleFriendRemoved = (friendId) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
  };

  if (!token) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">Connectez-vous pour voir vos amis</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            👥 Mes amis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {friends.length} ami{friends.length > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          component={Link}
          to="/find-friends"
          sx={{ textTransform: 'none' }}
        >
          Ajouter
        </Button>
      </Stack>

      {/* Recherche */}
      {friends.length > 0 && (
        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher un ami..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      )}

      {/* Liste */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredFriends.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          {friends.length === 0 ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Vous n'avez pas encore d'amis
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                component={Link}
                to="/find-friends"
                sx={{ textTransform: 'none' }}
              >
                Trouver des amis
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucun ami ne correspond à votre recherche
            </Typography>
          )}
        </Box>
      ) : (
        <List sx={{ pt: 0 }}>
          {filteredFriends.map((friend) => (
            <ListItem
              key={friend.id}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
              secondaryAction={
                <AddFriendButton
                  targetUserId={friend.id}
                  initialIsFriend={true}
                  onToggle={() => handleFriendRemoved(friend.id)}
                  size="small"
                />
              }
            >
              <ListItemAvatar>
                <Avatar
                  src={friend.avatar || DEFAULT_AVATAR}
                  alt={`${friend.firstname} ${friend.lastname}`}
                  sx={{ width: 48, height: 48 }}
                >
                  {friend.firstname?.[0]}{friend.lastname?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight={600}>
                    {friend.firstname || ''} {friend.lastname || ''}
                  </Typography>
                }
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {friend.email}
                    </Typography>
                    {friend.roles?.some(r => String(r).toUpperCase().includes('ADMIN')) && (
                      <Chip label="Admin" size="small" color="error" sx={{ height: 20 }} />
                    )}
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}