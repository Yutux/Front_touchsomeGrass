// src/components/UI/FavoriteButton.jsx
import React, { useState, useContext } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { 
  Favorite as FavoriteIcon, 
  FavoriteBorder as FavoriteBorderIcon 
} from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext/UserContext'; 
import request from '../utils/request';

/**
 * 🔥 Bouton Favoris - Compatible avec les nouveaux endpoints FromAuth
 * 
 * ✅ Le backend extrait automatiquement userId du JWT
 * ✅ Plus besoin de passer userId en prop
 * 
 * @param {Object} props
 * @param {number} props.spotId - ID du spot
 * @param {'spot'|'hiking'} props.type - Type de spot (spot ou hiking)
 * @param {boolean} props.initialIsFavorite - État initial (optionnel)
 * @param {Function} props.onToggle - Callback après toggle (optionnel)
 * @param {'small'|'medium'|'large'} props.size - Taille du bouton
 * @param {string} props.color - Couleur du bouton
 */
export default function FavoriteButton({ 
  spotId, 
  type = 'spot', 
  initialIsFavorite = false,
  onToggle,
  size = 'medium',
  color = 'error'
}) {
  const { token } = useContext(UserContext);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async (e) => {
    // Empêche la navigation si le bouton est dans un Link
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      alert("⚠️ Vous devez être connecté pour ajouter des favoris");
      return;
    }

    setLoading(true);

    try {
      // ✅ NOUVEAUX ENDPOINTS - Plus de userId dans l'URL !
      // Le backend extrait automatiquement userId du JWT via authHeader
      const endpoint = type === 'hiking'
        ? `http://localhost:8088/api/v1/user-relations/favorites/hiking-spots/${spotId}`
        : `http://localhost:8088/api/v1/user-relations/favorites/spots/${spotId}`;

      const method = isFavorite ? 'DELETE' : 'POST';

      const response = await request(endpoint, method, null, true); // ✅ auth = true

      if (response.status === 200) {
        setIsFavorite(!isFavorite);
        onToggle?.(!isFavorite); // Callback optionnel pour notifier le parent
      } else {
        console.error('Erreur:', response.data);
        alert(response.data?.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la modification des favoris:", error);
      alert("❌ Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Ne pas afficher le bouton si non connecté
  if (!token) return null;

  return (
    <Tooltip title={isFavorite ? "💔 Retirer des favoris" : "❤️ Ajouter aux favoris"}>
      <span> {/* Wrapper pour éviter les warnings MUI */}
        <IconButton 
          onClick={handleToggleFavorite}
          disabled={loading}
          color={color}
          size={size}
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.15)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          {loading ? (
            <CircularProgress 
              size={size === 'small' ? 18 : size === 'large' ? 28 : 24} 
              color={color} 
            />
          ) : isFavorite ? (
            <FavoriteIcon 
              sx={{ 
                animation: isFavorite ? 'heartbeat 0.3s ease-in-out' : 'none',
                '@keyframes heartbeat': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.3)' },
                  '100%': { transform: 'scale(1)' },
                },
              }} 
            />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}