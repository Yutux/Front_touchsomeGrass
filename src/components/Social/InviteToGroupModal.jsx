// src/components/Social/InviteToGroupModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext/UserContext';
import request from '../utils/request';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

/**
 * Modal pour inviter des amis dans un groupe
 * 
 * @param {Object} props
 * @param {boolean} props.open - État d'ouverture
 * @param {Function} props.onClose - Callback de fermeture
 * @param {number} props.groupId - ID du groupe
 * @param {Array} props.currentMembers - Membres actuels du groupe
 */
export default function InviteToGroupModal({ open, onClose, groupId, currentMembers = [] }) {
  const { token } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

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
    if (!open || !userId) return;

    const fetchFriends = async () => {
      setLoading(true);
      try {
        const response = await request(
          `http://localhost:8088/api/v1/user-relations/friends`,
          'GET',
          null,
          true
        );

        if (response?.data?.friends) {
          // Filtrer les amis qui ne sont pas déjà membres
          const currentMemberIds = currentMembers.map(m => m.userId);
          const availableFriends = response.data.friends.filter(
            friend => !currentMemberIds.includes(friend.id)
          );
          setFriends(availableFriends);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des amis:", error);
        setError("Erreur lors du chargement de vos amis");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [open, userId, currentMembers]);

  // Filtrer les amis par recherche
  const filteredFriends = friends.filter((friend) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${friend.firstname || ''} ${friend.lastname || ''}`.toLowerCase();
    const email = (friend.email || '').toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async () => {
    if (selectedFriends.length === 0) {
      setError('Veuillez sélectionner au moins un ami');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Inviter chaque ami sélectionné
      const invitePromises = selectedFriends.map((friendId) =>
        request(
          `http://localhost:8088/api/v1/groupSource/groups/${groupId}/members/add/${friendId}`,
          'POST',
          { userId: friendId },
          true
        )
      );

      await Promise.all(invitePromises);

      // Réinitialiser et fermer
      setSelectedFriends([]);
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'invitation:", error);
      setError("Erreur lors de l'invitation des membres");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedFriends([]);
      setSearchQuery('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">Inviter des amis</Typography>
            {selectedFriends.length > 0 && (
              <Chip
                size="small"
                label={`${selectedFriends.length} sélectionné${selectedFriends.length > 1 ? 's' : ''}`}
                color="primary"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
          <IconButton onClick={handleClose} disabled={submitting} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Recherche */}
        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher un ami..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading || submitting}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Liste des amis */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredFriends.length === 0 ? (
          <Alert severity="info">
            {friends.length === 0
              ? "Vous n'avez pas d'amis à inviter"
              : "Aucun ami ne correspond à votre recherche"}
          </Alert>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredFriends.map((friend) => (
              <ListItem
                key={friend.id}
                button
                onClick={() => handleToggleFriend(friend.id)}
                disabled={submitting}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: selectedFriends.includes(friend.id) ? 'action.selected' : 'transparent',
                }}
              >
                <Checkbox
                  checked={selectedFriends.includes(friend.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemAvatar>
                  <Avatar src={friend.avatar || DEFAULT_AVATAR}>
                    {friend.firstname?.[0]}{friend.lastname?.[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${friend.firstname || ''} ${friend.lastname || ''}`}
                  secondary={friend.email}
                />
              </ListItem>
            ))}
          </List>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting} sx={{ textTransform: 'none' }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || selectedFriends.length === 0}
          startIcon={submitting && <CircularProgress size={16} />}
          sx={{ textTransform: 'none' }}
        >
          {submitting ? 'Invitation...' : `Inviter (${selectedFriends.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}