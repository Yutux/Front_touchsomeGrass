import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { UserContext } from '../contexts/UserContext/UserContext';
import request from '../utils/request';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import RatingStars from './RatingStars';

/**
 * Section complète de commentaires pour un spot ou hiking spot
 * 
 * @param {Object} props
 * @param {number} props.spotId - ID du spot
 * @param {'spot'|'hiking'} props.type - Type de spot
 */
export default function CommentSection({ spotId, type = 'spot' }) {
  const { token } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'rating', 'oldest'
  const [showForm, setShowForm] = useState(false);

  // Récupérer l'ID utilisateur
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await request(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/user`,
          "GET",
          null,
          true
        );
        if (res.status === 200 && res.data?.userApp) {
          setUserId(res.data.userApp.id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
      }
    };

    fetchUser();
  }, [token]);

  // Charger les commentaires
  useEffect(() => {
    if (!spotId) return;

    const fetchComments = async () => {
      setLoading(true);
      try {
        const endpoint = type === 'hiking'
          ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/user-relations/comments/hiking-spot/${spotId}`
          : `${import.meta.env.VITE_API_BASE_URL}/api/v1/user-relations/comments/spot/${spotId}`;

        const response = await request(endpoint, "GET", null, false);

        if (response?.data?.comments) {
          setComments(response.data.comments);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des commentaires:", error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [spotId, type]);

  // Trier les commentaires
  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // Filtrer les commentaires de niveau supérieur (pas de parent)
  const topLevelComments = sortedComments.filter(comment => !comment.parentCommentId);

  // Calculer la moyenne des notes
  const averageRating = comments.length > 0
    ? comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length
    : 0;

  const handleCommentAdded = (newComment) => {
    setComments(prev => [newComment, ...prev]);
    setShowForm(false);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleReplyAdded = (reply) => {
    setComments(prev => [reply, ...prev]);
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              💬 Commentaires ({comments.length})
            </Typography>
            {comments.length > 0 && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <RatingStars value={averageRating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {averageRating.toFixed(1)} / 5 ({comments.length} avis)
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Tri */}
          {comments.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortBy}
                label="Trier par"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="recent">Plus récents</MenuItem>
                <MenuItem value="oldest">Plus anciens</MenuItem>
                <MenuItem value="rating">Meilleures notes</MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Formulaire d'ajout de commentaire */}
      {token ? (
        <Box sx={{ mb: 3 }}>
          {!showForm ? (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setShowForm(true)}
              sx={{ py: 1.5, textTransform: 'none', borderRadius: 2 }}
            >
              ✍️ Laisser un commentaire
            </Button>
          ) : (
            <Box>
              <CommentForm
                spotId={spotId}
                type={type}
                userId={userId}
                onCommentAdded={handleCommentAdded}
                onCancel={() => setShowForm(false)}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Connectez-vous pour laisser un commentaire
        </Alert>
      )}

      {/* Liste des commentaires */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : topLevelComments.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Aucun commentaire pour le moment. Soyez le premier à partager votre expérience ! 🌟
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              allComments={comments}
              userId={userId}
              onDelete={handleCommentDeleted}
              onReplyAdded={handleReplyAdded}
              spotId={spotId}
              type={type}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}