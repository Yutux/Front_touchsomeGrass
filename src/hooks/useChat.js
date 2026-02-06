// src/hooks/useChat.js
import { useContext } from 'react';
import { ChatContext } from '../components/contexts/ChatContext/ChatContext'; 
/**
 * Hook pour accéder au contexte de chat
 * 
 * Usage:
 * const { unreadCount, conversations, sendMessage } = useChat();
 */
export default function useChat() {
  const context = useContext(ChatContext);
  
  if (!context) {
    // Si ChatProvider n'est pas encore configuré, retourner des valeurs par défaut
    console.warn('useChat: ChatProvider non trouvé, retour de valeurs par défaut');
    return {
      unreadCount: 0,
      conversations: [],
      messages: [],
      loading: false,
      activeConversationId: null,
      websocketConnected: false,
      selectConversation: () => {},
      sendMessage: () => {},
      loadConversations: () => {},
      loadMessages: () => {},
      markAsRead: () => {},
      sendTypingNotification: () => {},
      updateStatus: () => {},
      setActiveConversationId: () => {},
      onlineUsers: new Set(),
      typingUsers: [],
      allMessages: {},
    };
  }
  
  return context;
}