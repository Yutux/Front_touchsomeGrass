import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import useChat from '../../hooks/useChat';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

/**
 * Liste des conversations avec badge de messages non lus
 */
export default function ConversationList({ onSelectConversation }) { // ✅ Ajout de la prop
  const {
    conversations,
    activeConversationId,
    selectConversation,
    loading,
    onlineUsers,
    unreadCount,
  } = useChat();

  // ✅ Handler qui appelle à la fois le context ET le parent
  const handleSelect = (conversationId) => {
    selectConversation(conversationId); // Sélectionner dans le context
    onSelectConversation?.(conversationId); // Callback pour le parent (ChatPage)
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (conversations.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Aucune conversation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Commencez une conversation avec vos amis ou groupes
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>
            Messages
          </Typography>
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} non lu${unreadCount > 1 ? 's' : ''}`} 
              color="error" 
              size="small" 
            />
          )}
        </Stack>
      </Box>

      {/* Liste des conversations */}
      <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={activeConversationId === conversation.id}
            onSelect={() => handleSelect(conversation.id)} // ✅ Utilise handleSelect
            isOnline={onlineUsers.has(conversation.otherUserId)}
          />
        ))}
      </List>
    </Paper>
  );
}

/**
 * Item de conversation
 */
function ConversationItem({ conversation, isActive, onSelect, isOnline }) {
  const isGroupConversation = conversation.type === 'GROUP';
  const unreadCount = conversation.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  // Titre de la conversation
  const title = conversation.title || 
    (isGroupConversation ? 'Groupe' : conversation.otherUserName || 'Conversation');

  // Dernier message
  const lastMessage = conversation.lastMessage?.content || 'Aucun message';
  const lastMessageTime = conversation.lastMessageAt 
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), { 
        addSuffix: true, 
        locale: fr 
      })
    : '';

  return (
    <>
      <ListItemButton
        selected={isActive}
        onClick={onSelect}
        sx={{
          px: 2,
          py: 1.5,
          '&.Mui-selected': {
            bgcolor: 'action.selected',
            borderLeft: 3,
            borderColor: 'primary.main',
          },
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ListItemAvatar>
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
            invisible={isGroupConversation}
          >
            <Avatar
              src={conversation.imageUrl || DEFAULT_AVATAR}
              sx={{ width: 48, height: 48 }}
            >
              {isGroupConversation ? <GroupsIcon /> : <PersonIcon />}
            </Avatar>
          </Badge>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="subtitle2"
                fontWeight={hasUnread ? 700 : 500}
                sx={{ flex: 1 }}
                noWrap
              >
                {title}
              </Typography>
              {lastMessageTime && (
                <Typography variant="caption" color="text.secondary">
                  {lastMessageTime}
                </Typography>
              )}
            </Stack>
          }
          secondary={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: hasUnread ? 600 : 400,
                }}
              >
                {lastMessage}
              </Typography>
              {hasUnread && (
                <Chip
                  label={unreadCount}
                  color="error"
                  size="small"
                  sx={{ height: 20, minWidth: 20, fontSize: 11 }}
                />
              )}
            </Stack>
          }
        />
      </ListItemButton>
      <Divider variant="inset" component="li" />
    </>
  );
}