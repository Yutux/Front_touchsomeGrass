// src/components/Social/AddFriendButton.jsx
// 🔥 VERSION FINALE avec NotificationsContext unifié

import React, { useState, useEffect, useContext } from 'react';
import { Button, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { 
  PersonAdd as PersonAddIcon, 
  PersonRemove as PersonRemoveIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext/UserContext'; 
import { useNotifications } from '../contexts/NotificationsContext/NotificationsContext';
import request from '../utils/request';

/**
 * Bouton pour gérer les relations d'amitié
 * - Envoyer une demande d'ami
 * - Annuler une demande envoyée
 * - Accepter une demande reçue
 * - Retirer un ami
 * 
 * @param {Object} props
 * @param {number} props.targetUserId - ID de l'utilisateur cible
 * @param {boolean} props.initialIsFriend - Si déjà ami (optionnel)
 * @param {Function} props.onToggle - Callback après changement (optionnel)
 * @param {'button'|'icon'} props.variant - Style du bouton
 * @param {'small'|'medium'|'large'} props.size - Taille
 */
export default function AddFriendButton({ 
  targetUserId, 
  initialIsFriend = false,
  onToggle,
  variant = 'button',
  size = 'medium',
}) {
  const { token } = useContext(UserContext);
  const { incrementUnread } = useNotifications(); // 🔥 Utilise NotificationsContext unifié
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isFriend, setIsFriend] = useState(initialIsFriend);
  const [requestStatus, setRequestStatus] = useState(null); // 'SENT', 'RECEIVED', null
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Récupérer l'ID de l'utilisateur connecté
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
          setCurrentUserId(res.data.userApp.id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
      }
    };

    fetchUser();
  }, [token]);

  // Vérifier s'il y a une demande en attente
  useEffect(() => {
    if (!token || !currentUserId) return;

    const checkPendingRequest = async () => {
      try {
        // Vérifier les demandes envoyées
        const sentRes = await request(
          'http://localhost:8088/api/v1/friend-requests/sent',
          'GET',
          null,
          true
        );

        if (sentRes.data?.requests) {
          const sentRequest = sentRes.data.requests.find(
            req => req.receiverId === targetUserId && req.status === 'PENDING'
          );
          if (sentRequest) {
            setRequestStatus('SENT');
            setRequestId(sentRequest.id);
            return;
          }
        }

        // Vérifier les demandes reçues
        const receivedRes = await request(
          'http://localhost:8088/api/v1/friend-requests/received',
          'GET',
          null,
          true
        );

        if (receivedRes.data?.requests) {
          const receivedRequest = receivedRes.data.requests.find(
            req => req.senderId === targetUserId && req.status === 'PENDING'
          );
          if (receivedRequest) {
            setRequestStatus('RECEIVED');
            setRequestId(receivedRequest.id);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des demandes:', error);
      }
    };

    checkPendingRequest();
  }, [token, currentUserId, targetUserId]);

  // Ne pas afficher si l'utilisateur regarde son propre profil
  if (!token || !currentUserId || currentUserId === targetUserId) {
    return null;
  }

  // Envoyer une demande d'ami
  const handleSendRequest = async () => {
    setLoading(true);
    try {
      const response = await request(
        `http://localhost:8088/api/v1/friend-requests/${targetUserId}`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        setRequestStatus('SENT');
        setRequestId(response.data.request?.id);
        incrementUnread(); // 🔥 Incrémente le badge unifié
        alert('✅ Demande d\'ami envoyée !');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  // Annuler une demande envoyée
  const handleCancelRequest = async () => {
    if (!requestId) return;

    setLoading(true);
    try {
      const response = await request(
        `http://localhost:8088/api/v1/friend-requests/${requestId}`,
        'DELETE',
        null,
        true
      );

      if (response.status === 200) {
        setRequestStatus(null);
        setRequestId(null);
        alert('✅ Demande annulée');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Accepter une demande reçue
  const handleAcceptRequest = async () => {
    if (!requestId) return;

    setLoading(true);
    try {
      const response = await request(
        `http://localhost:8088/api/v1/friend-requests/${requestId}/accept`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        setRequestStatus(null);
        setRequestId(null);
        setIsFriend(true);
        onToggle?.(true);
        alert('✅ Demande acceptée ! Vous êtes maintenant amis.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Retirer un ami
  const handleRemoveFriend = async () => {
    setLoading(true);
    try {
      const response = await request(
        `http://localhost:8088/api/v1/user-relations/friends/${targetUserId}`,
        'DELETE',
        null,
        true
      );

      if (response.status === 200) {
        setIsFriend(false);
        onToggle?.(false);
        alert('❌ Ami retiré');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Déterminer l'action et le label
  let action, label, icon, color, buttonVariant;

  if (isFriend) {
    // Déjà ami
    action = handleRemoveFriend;
    label = 'Retirer';
    icon = <PersonRemoveIcon />;
    color = 'inherit';
    buttonVariant = 'outlined';
  } else if (requestStatus === 'SENT') {
    // Demande envoyée en attente
    action = handleCancelRequest;
    label = 'Demande envoyée';
    icon = <ScheduleIcon />;
    color = 'warning';
    buttonVariant = 'outlined';
  } else if (requestStatus === 'RECEIVED') {
    // Demande reçue en attente
    action = handleAcceptRequest;
    label = 'Accepter';
    icon = <PersonAddIcon />;
    color = 'success';
    buttonVariant = 'contained';
  } else {
    // Aucune relation
    action = handleSendRequest;
    label = 'Ajouter ami';
    icon = <PersonAddIcon />;
    color = 'primary';
    buttonVariant = 'contained';
  }

  if (variant === 'icon') {
    return (
      <Tooltip title={label}>
        <IconButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            action();
          }}
          disabled={loading}
          color={color}
          size={size}
        >
          {loading ? <CircularProgress size={20} /> : icon}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={buttonVariant}
      color={color}
      startIcon={loading ? <CircularProgress size={16} /> : icon}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
      }}
      disabled={loading}
      size={size}
      sx={{ textTransform: 'none' }}
    >
      {loading ? 'Chargement...' : label}
    </Button>
  );
}