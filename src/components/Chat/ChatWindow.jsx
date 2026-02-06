import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Divider,
  Badge,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import useChat from '../../hooks/useChat';
import MessageBubble from './MessageBubble';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

/**
 * Fenêtre de chat complète
 */
export default function ChatWindow() {
  const {
    activeConversationId,
    messages,
    conversations,
    sendMessage,
    onlineUsers,
    typingUsers,
    sendTypingNotification,
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Conversation active
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gestion de la frappe (typing indicator)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    if (!activeConversationId) return;

    // Envoyer "is typing"
    if (value && !isTyping) {
      setIsTyping(true);
      sendTypingNotification(activeConversationId, null, 'Vous', true);
    }

    // Reset le timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Arrêter "is typing" après 3 secondes d'inactivité
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingNotification(activeConversationId, null, 'Vous', false);
      }
    }, 3000);
  };

  // Envoyer un message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !activeConversationId) return;

    sendMessage(activeConversationId, messageInput.trim());
    setMessageInput('');
    setIsTyping(false);

    // Annuler le timeout de typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTypingNotification(activeConversationId, null, 'Vous', false);
  };

  // Cleanup du timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Si aucune conversation sélectionnée
  if (!activeConversationId) {
    return (
      <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Sélectionnez une conversation
        </Typography>
      </Paper>
    );
  }

  const isGroupConversation = activeConversation?.type === 'GROUP';
  const isOnline = !isGroupConversation && onlineUsers.has(activeConversation?.otherUserId);
  const conversationTitle = activeConversation?.title || 'Conversation';

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <ChatHeader
        title={conversationTitle}
        avatar={activeConversation?.imageUrl || DEFAULT_AVATAR}
        isOnline={isOnline}
        isGroup={isGroupConversation}
      />

      <Divider />

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: '#f5f5f5',
          backgroundImage: 'url(/chat-bg.png)', // Optionnel : image de fond
          backgroundSize: 'cover',
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Aucun message. Commencez la conversation !
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {/* Indicateur "typing" */}
            {typingUsers.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  {typingUsers.length === 1 ? 'Quelqu\'un écrit' : 'Plusieurs personnes écrivent'}...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <Divider />

      {/* Input */}
      <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Écrivez un message..."
          value={messageInput}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton size="small">
                  <AttachFileIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <EmojiIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  type="submit" 
                  color="primary" 
                  disabled={!messageInput.trim()}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
        />
      </Box>
    </Paper>
  );
}

/**
 * Header de la conversation
 */
function ChatHeader({ title, avatar, isOnline, isGroup }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ p: 2 }}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: isOnline ? '#44b700' : '#bdbdbd',
            color: isOnline ? '#44b700' : '#bdbdbd',
            boxShadow: `0 0 0 2px white`,
            width: 12,
            height: 12,
            borderRadius: '50%',
          },
        }}
        invisible={isGroup}
      >
        <Avatar src={avatar} sx={{ width: 40, height: 40 }} />
      </Badge>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        {!isGroup && (
          <Typography variant="caption" color="text.secondary">
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Typography>
        )}
      </Box>

      <IconButton>
        <MoreVertIcon />
      </IconButton>
    </Stack>
  );
}