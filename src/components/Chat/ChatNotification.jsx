// src/components/Chat/ChatNotification.jsx
import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Avatar,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

/**
 * Notification toast pour nouveaux messages
 * Affiche un toast quand un nouveau message arrive
 */
export default function ChatNotification({ 
  message, 
  onClose, 
  onReply,
  autoHideDuration = 5000 
}) {
  const [open, setOpen] = useState(!!message);

  useEffect(() => {
    setOpen(!!message);
  }, [message]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    onClose?.();
  };

  const handleReply = () => {
    setOpen(false);
    onReply?.(message);
  };

  if (!message) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity="info"
        variant="filled"
        onClose={handleClose}
        sx={{
          width: '100%',
          minWidth: 300,
          bgcolor: '#1976d2',
          color: 'white',
          '& .MuiAlert-icon': {
            display: 'none',
          },
        }}
        action={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleReply}
              sx={{ color: 'white' }}
            >
              <ReplyIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: 'white' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={message.senderAvatar || DEFAULT_AVATAR}
            sx={{ width: 40, height: 40 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {message.senderName || 'Nouveau message'}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 220,
              }}
            >
              {message.content}
            </Typography>
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
}