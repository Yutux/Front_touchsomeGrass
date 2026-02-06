import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Paper,
} from '@mui/material';
import {
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UserContext } from '../contexts/UserContext/UserContext'; 

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

/**
 * Bulle de message stylée
 */
export default function MessageBubble({ message }) {
  const { user } = useContext(UserContext);
  
  // Est-ce que c'est mon message ?
  const isOwnMessage = message.senderId === user?.id;

  // Formatage de la date
  const messageDate = new Date(message.createdAt);
  let timeDisplay = '';

  if (isToday(messageDate)) {
    timeDisplay = format(messageDate, 'HH:mm');
  } else if (isYesterday(messageDate)) {
    timeDisplay = `Hier ${format(messageDate, 'HH:mm')}`;
  } else {
    timeDisplay = format(messageDate, 'dd/MM/yyyy HH:mm', { locale: fr });
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Stack
        direction={isOwnMessage ? 'row-reverse' : 'row'}
        spacing={1}
        sx={{ maxWidth: '70%', alignItems: 'flex-end' }}
      >
        {/* Avatar (seulement pour les messages reçus) */}
        {!isOwnMessage && (
          <Avatar
            src={message.senderAvatar || DEFAULT_AVATAR}
            sx={{ width: 32, height: 32 }}
          />
        )}

        {/* Bulle de message */}
        <Box>
          {/* Nom de l'expéditeur (seulement pour les messages reçus) */}
          {!isOwnMessage && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1, mb: 0.5, display: 'block' }}
            >
              {message.senderName}
            </Typography>
          )}

          <Paper
            elevation={1}
            sx={{
              px: 2,
              py: 1,
              borderRadius: isOwnMessage
                ? '18px 18px 4px 18px'
                : '18px 18px 18px 4px',
              bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
              color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
              wordWrap: 'break-word',
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
          </Paper>

          {/* Heure et statut de lecture */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent={isOwnMessage ? 'flex-end' : 'flex-start'}
            sx={{ mt: 0.5, px: 1 }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              {timeDisplay}
            </Typography>

            {/* Indicateur de lecture (seulement pour mes messages) */}
            {isOwnMessage && (
              message.isRead ? (
                <DoneAllIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              ) : (
                <DoneIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              )
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}