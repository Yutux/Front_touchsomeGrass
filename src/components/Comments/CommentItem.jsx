import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Stack,
  Chip,
  Paper,
  Collapse,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import request from '../utils/request';
import RatingStars from './RatingStars';
import CommentForm from './CommentForm';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

/**
 * Composant pour afficher un commentaire individuel
 */
export default function CommentItem({ 
  comment, 
  allComments, 
  userId, 
  onDelete, 
  onReplyAdded,
  spotId,
  type,
  depth = 0 
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = userId && comment.user?.id === userId;
  const replies = allComments.filter(c => c.parentCommentId === comment.id);

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    setDeleting(true);
    try {
      const response = await request(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user-relations/comments/${comment.id}`,
        "DELETE",
        null,
        true
      );

      if (response.status === 200) {
        onDelete(comment.id);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du commentaire");
    } finally {
      setDeleting(false);
    }
  };

  const handleReplyAdded = (reply) => {
    onReplyAdded(reply);
    setShowReplyForm(false);
  };

  const maxDepth = 3; // Limite de profondeur pour les réponses
  const canReply = depth < maxDepth;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Ligne verticale pour les réponses */}
      {depth > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: -16,
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: 'divider',
          }}
        />
      )}

      <Paper
        variant={depth > 0 ? 'outlined' : 'elevation'}
        elevation={depth === 0 ? 1 : 0}
        sx={{
          p: 2,
          ml: depth * 4,
          borderRadius: 2,
          bgcolor: depth > 0 ? 'grey.50' : 'background.paper',
        }}
      >
        <Stack direction="row" spacing={2}>
          {/* Avatar */}
          <Avatar
            src={comment.user?.avatar || DEFAULT_AVATAR}
            alt={comment.user?.firstname || 'User'}
            sx={{ width: 40, height: 40 }}
          >
            {comment.user?.firstname?.[0]}{comment.user?.lastname?.[0]}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {comment.user?.firstname || ''} {comment.user?.lastname || ''}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  {comment.rating > 0 && (
                    <RatingStars value={comment.rating} readOnly size="small" />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(comment.createdAt)}
                  </Typography>
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <Chip label="Modifié" size="small" sx={{ height: 18, fontSize: 10 }} />
                  )}
                </Stack>
              </Box>

              {/* Actions */}
              {isOwner && (
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" disabled>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Stack>

            {/* Contenu */}
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                mb: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {comment.content}
            </Typography>

            {/* Bouton répondre */}
            {canReply && userId && (
              <Button
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => setShowReplyForm(!showReplyForm)}
                sx={{ textTransform: 'none' }}
              >
                Répondre
              </Button>
            )}

            {/* Formulaire de réponse */}
            <Collapse in={showReplyForm}>
              <Box sx={{ mt: 2 }}>
                <CommentForm
                  spotId={spotId}
                  type={type}
                  userId={userId}
                  parentCommentId={comment.id}
                  onCommentAdded={handleReplyAdded}
                  onCancel={() => setShowReplyForm(false)}
                  compact
                />
              </Box>
            </Collapse>
          </Box>
        </Stack>
      </Paper>

      {/* Réponses imbriquées */}
      {replies.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {replies.map((reply) => (
            <Box key={reply.id} sx={{ mt: 1 }}>
              <CommentItem
                comment={reply}
                allComments={allComments}
                userId={userId}
                onDelete={onDelete}
                onReplyAdded={onReplyAdded}
                spotId={spotId}
                type={type}
                depth={depth + 1}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}