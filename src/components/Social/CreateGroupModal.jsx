
import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext/UserContext';
import request from '../utils/request';

export default function CreateGroupModal({ open, onClose, onGroupCreated }) {
  const { token } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Le nom du groupe est requis');
      return;
    }

    setLoading(true);

    try {
      // ✅ UN SEUL APPEL : Le backend extrait automatiquement userId du token
      const response = await request(
        'http://localhost:8088/api/v1/groupSource/create',
        'POST',
        {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          isPrivate: formData.isPrivate,
          // ✅ Plus besoin de ownerId - le backend l'extrait du token JWT
        },
        true // ✅ auth = true (envoie le token)
      );

      if (response.status === 200 && response.data?.group) {
        onGroupCreated?.(response.data.group);
        setFormData({ name: '', description: '', isPrivate: false });
        onClose();
      } else {
        setError(response.data?.message || 'Erreur lors de la création du groupe');
      }
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '', isPrivate: false });
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
          Créer un groupe
          <IconButton onClick={handleClose} disabled={loading} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Nom du groupe *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            autoFocus
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 100 }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            multiline
            minRows={3}
            maxRows={6}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 500 }}
            helperText={`${formData.description.length}/500 caractères`}
          />

          <FormControlLabel
            control={
              <Switch
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label={
              <Box>
                Groupe privé
                <Box component="span" sx={{ display: 'block', fontSize: 12, color: 'text.secondary' }}>
                  {formData.isPrivate
                    ? '🔒 Seuls les membres invités peuvent rejoindre'
                    : '🌍 Tout le monde peut rejoindre'}
                </Box>
              </Box>
            }
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none' }}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
            sx={{ textTransform: 'none' }}
          >
            {loading ? 'Création...' : 'Créer le groupe'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}