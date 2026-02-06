import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import ConversationList from '../../Chat/ConversationList';
import ChatWindow from '../../Chat/ChatWindow';
import ChatNotification from '../../components/Chat/ChatNotification';
import useChat from '../../hooks/useChat';
import useNotificationSound from '../../../hooks/useNotificationSound';
import { UserContext } from '../../contexts/UserContext/UserContext'; 
import request from '../../utils/request';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

/**
 * Page principale de chat
 * - Liste des conversations à gauche
 * - Fenêtre de chat à droite
 * - Notifications toast
 * - Sons de notification
 * - Routing /chat/:conversationId
 */
export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // ✅ Ajouté pour détecter ses propres messages
  
  const { 
    selectConversation, 
    activeConversationId,
    messages,
    websocketConnected,
  } = useChat();
  
  const { playMessageSound } = useNotificationSound();

  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Synchroniser l'URL avec la conversation active
  useEffect(() => {
    if (conversationId && conversationId !== String(activeConversationId)) {
      selectConversation(parseInt(conversationId));
    }
  }, [conversationId, activeConversationId, selectConversation]);

  // ✅ Jouer un son quand un nouveau message arrive (corrigé)
  useEffect(() => {
    if (messages.length > lastMessageCount && lastMessageCount > 0) {
      const newMessage = messages[messages.length - 1];
      
      // ✅ Comparer senderId avec mon userId
      if (newMessage && newMessage.senderId !== user?.id) {
        playMessageSound();
        
        // Afficher la notification si la fenêtre n'est pas focus
        if (!document.hasFocus()) {
          setNotificationMessage(newMessage);
        }
      }
    }
    setLastMessageCount(messages.length);
  }, [messages, lastMessageCount, playMessageSound, user?.id]); // ✅ Ajout de user.id

  // Gérer la sélection d'une conversation
  const handleSelectConversation = (id) => {
    selectConversation(id);
    navigate(`/chat/${id}`);
  };

  // Répondre à une notification
  const handleReplyToNotification = (message) => {
    if (message?.conversationId) {
      handleSelectConversation(message.conversationId);
    }
    setNotificationMessage(null);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          💬 Messages
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={websocketConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
            size="small"
            color={websocketConnected ? 'success' : 'error'}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewConversationOpen(true)}
          >
            Nouvelle conversation
          </Button>
        </Box>
      </Box>

      {/* Layout Chat */}
      <Grid container spacing={2} sx={{ height: 'calc(100% - 80px)' }}>
        {/* Liste des conversations */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <ConversationList onSelectConversation={handleSelectConversation} />
        </Grid>

        {/* Fenêtre de chat */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <ChatWindow />
        </Grid>
      </Grid>

      {/* Notification toast */}
      <ChatNotification
        message={notificationMessage}
        onClose={() => setNotificationMessage(null)}
        onReply={handleReplyToNotification}
      />

      {/* Dialog: Nouvelle conversation */}
      <NewConversationDialog
        open={newConversationOpen}
        onClose={() => setNewConversationOpen(false)}
        onSelect={(userId) => {
          setNewConversationOpen(false);
          // TODO: Créer la conversation avec cet utilisateur
          console.log('Créer conversation avec:', userId);
        }}
      />
    </Box>
  );
}

/**
 * Dialog pour créer une nouvelle conversation
 */
function NewConversationDialog({ open, onClose, onSelect }) {
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger la liste des amis
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    request('http://localhost:8088/api/v1/user-relations/friends', 'GET', null, true)
      .then((response) => {
        if (response.status === 200 && response.data?.friends) {
          setFriends(response.data.friends);
        }
      })
      .catch((error) => console.error('Erreur chargement amis:', error))
      .finally(() => setLoading(false));
  }, [open]);

  // Filtrer les amis par recherche
  const filteredFriends = friends.filter((friend) =>
    friend.name?.toLowerCase().includes(search.toLowerCase()) ||
    friend.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nouvelle conversation</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Rechercher un ami..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />

        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading ? (
            <Typography align="center" color="text.secondary">
              Chargement...
            </Typography>
          ) : filteredFriends.length === 0 ? (
            <Typography align="center" color="text.secondary">
              Aucun ami trouvé
            </Typography>
          ) : (
            filteredFriends.map((friend) => (
              <ListItemButton
                key={friend.id}
                onClick={() => onSelect(friend.id)}
              >
                <ListItemAvatar>
                  <Avatar src={friend.avatar || DEFAULT_AVATAR}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={friend.name}
                  secondary={friend.email}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
      </DialogActions>
    </Dialog>
  );
}