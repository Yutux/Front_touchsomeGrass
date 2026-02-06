import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import request from '../utils/request';
import RatingStars from './RatingStars';

/**
 * Formulaire pour ajouter un commentaire ou une réponse
 */
export default function CommentForm({
  spotId,
  type,
  userId,
  parentCommentId = null,
  onCommentAdded,
  onCancel,
  compact = false,
}) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isReply = !!parentCommentId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    if (!isReply && rating === 0) {
      setError('Veuillez donner une note');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        userId: userId,
        content: content.trim(),
        rating: isReply ? null : rating, // Pas de rating pour les réponses
        parentCommentId: parentCommentId,
      };

      // Ajouter le spot approprié
      if (type === 'hiking') {
        payload.hikingSpotId = spotId;
      } else {
        payload.spotId = spotId;
      }

      const response = await request(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user-relations/comments`,
        'POST',
        payload,
        true
      );

      if (response.status === 200 && response.data?.comment) {
        onCommentAdded(response.data.comment);
        setContent('');
        setRating(0);
      } else {
        setError('Erreur lors de l\'ajout du commentaire');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: compact ? 2 : 2.5,
        bgcolor: compact ? 'grey.50' : 'background.paper',
        borderRadius: 2,
        border: compact ? '1px solid' : 'none',
        borderColor: 'divider',
      }}
    >
      {!isReply && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Votre note *
          </Typography>
          <RatingStars
            value={rating}
            onChange={(newValue) => setRating(newValue)}
            size="large"
          />
        </Box>
      )}

      <TextField
        fullWidth
        multiline
        minRows={compact ? 2 : 3}
        maxRows={8}
        placeholder={isReply ? 'Écrivez votre réponse...' : 'Partagez votre expérience...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={submitting}
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {onCancel && (
          <Button
            onClick={onCancel}
            disabled={submitting}
            sx={{ textTransform: 'none' }}
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
          sx={{ textTransform: 'none' }}
        >
          {submitting ? 'Envoi...' : isReply ? 'Répondre' : 'Publier'}
        </Button>
      </Stack>
    </Box>
  );
}