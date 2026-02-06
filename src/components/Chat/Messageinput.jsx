import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Image as ImageIcon,
  Description as FileIcon,
} from '@mui/icons-material';

// Emojis populaires
const EMOJI_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💪'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
  symbols: ['✅', '❌', '⭐', '🔥', '💯', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚡'],
};

/**
 * Input avancé pour envoyer des messages
 * - Typing indicator
 * - Emoji picker
 * - Support multilignes
 * - Pièces jointes (placeholder)
 */
export default function MessageInput({ 
  onSendMessage, 
  onTyping, 
  disabled = false,
  placeholder = "Écrivez un message..." 
}) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const [attachAnchor, setAttachAnchor] = useState(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Gérer la saisie (typing indicator)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Déclencher "is typing"
    if (value && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    // Reset le timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Arrêter "is typing" après 2 secondes d'inactivité
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }, 2000);
  };

  // Envoyer le message
  const handleSend = (e) => {
    e?.preventDefault();

    if (!message.trim()) return;

    onSendMessage(message.trim());
    setMessage('');
    setIsTyping(false);

    // Annuler le timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    onTyping?.(false);

    // Focus sur l'input
    inputRef.current?.focus();
  };

  // Gérer Entrée (Shift+Entrée pour nouvelle ligne)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Insérer un emoji
  const handleEmojiClick = (emoji) => {
    const cursorPos = inputRef.current?.selectionStart || message.length;
    const newMessage = 
      message.substring(0, cursorPos) + 
      emoji + 
      message.substring(cursorPos);
    
    setMessage(newMessage);
    setEmojiAnchor(null);
    
    // Focus et repositionner le curseur
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(
        cursorPos + emoji.length,
        cursorPos + emoji.length
      );
    }, 0);
  };

  return (
    <Box component="form" onSubmit={handleSend} sx={{ p: 2 }}>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder={placeholder}
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        inputRef={inputRef}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {/* Bouton Pièces jointes */}
              <IconButton 
                size="small"
                onClick={(e) => setAttachAnchor(e.currentTarget)}
                disabled={disabled}
              >
                <AttachFileIcon fontSize="small" />
              </IconButton>

              {/* Bouton Emoji */}
              <IconButton 
                size="small"
                onClick={(e) => setEmojiAnchor(e.currentTarget)}
                disabled={disabled}
              >
                <EmojiIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {/* Bouton Envoyer */}
              <IconButton 
                type="submit" 
                color="primary" 
                disabled={!message.trim() || disabled}
                sx={{
                  transition: 'all 0.2s',
                  '&:not(:disabled)': {
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            bgcolor: 'background.paper',
          },
        }}
      />

      {/* Menu Emoji */}
      <Menu
        anchorEl={emojiAnchor}
        open={Boolean(emojiAnchor)}
        onClose={() => setEmojiAnchor(null)}
        PaperProps={{
          sx: { 
            maxHeight: 300, 
            width: 320,
            p: 1,
          },
        }}
      >
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <Box key={category} sx={{ mb: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                px: 1, 
                textTransform: 'capitalize',
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              {category}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 0.5 }}>
              {emojis.map((emoji) => (
                <IconButton
                  key={emoji}
                  size="small"
                  onClick={() => handleEmojiClick(emoji)}
                  sx={{ 
                    fontSize: 20,
                    p: 0.5,
                    '&:hover': {
                      transform: 'scale(1.2)',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {emoji}
                </IconButton>
              ))}
            </Box>
          </Box>
        ))}
      </Menu>

      {/* Menu Pièces jointes */}
      <Menu
        anchorEl={attachAnchor}
        open={Boolean(attachAnchor)}
        onClose={() => setAttachAnchor(null)}
      >
        <MenuItem onClick={() => { /* TODO: Upload image */ setAttachAnchor(null); }}>
          <ImageIcon sx={{ mr: 1 }} fontSize="small" />
          Image
        </MenuItem>
        <MenuItem onClick={() => { /* TODO: Upload file */ setAttachAnchor(null); }}>
          <FileIcon sx={{ mr: 1 }} fontSize="small" />
          Fichier
        </MenuItem>
      </Menu>
    </Box>
  );
}