import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from '../UserContext/UserContext';
import useWebSocket from '../../../hooks/useWebSocket';
import request from '../../utils/request';

export const ChatContext = createContext();

export default function ChatProvider({ children }) {
  const { token } = useContext(UserContext);
  const websocket = useWebSocket();

  // États
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState({}); // { conversationId: [messages] }
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({}); // { conversationId: [userIds] }
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // ✅ Guard pour limiter les appels (utilise window.location)
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      const shouldLoadNow = token && (
        path.startsWith('/groups') ||
        path.startsWith('/conversations') ||
        path.startsWith('/messages')
      );
      setShouldLoad(shouldLoadNow);
    };

    checkPath();

    // Écouter les changements de route
    window.addEventListener('popstate', checkPath);
    
    // Pour les navigations sans popstate (Link de React Router)
    const interval = setInterval(checkPath, 1000);

    return () => {
      window.removeEventListener('popstate', checkPath);
      clearInterval(interval);
    };
  }, [token]);

  // Charger toutes les conversations de l'utilisateur
  const loadConversations = useCallback(async () => {
    if (!shouldLoad) return; // ✅ Guard

    setLoading(true);
    try {
      const response = await request(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user-relations/conversations`,
        'GET',
        null,
        true
      );

      if (response.status === 200 && response.data?.conversations) {
        setConversations(response.data.conversations);
        
        // Calculer le nombre de messages non lus
        const totalUnread = response.data.conversations.reduce((acc, conv) => {
          return acc + (conv.unreadCount || 0);
        }, 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [shouldLoad]);

  // Charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!token) return;

    try {
      const response = await request(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user-relations/conversations/${conversationId}/messages`,
        'GET',
        null,
        true
      );

      if (response.status === 200 && response.data?.messages) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: response.data.messages,
        }));
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
    }
  }, [token]);

  // Sélectionner une conversation
  const selectConversation = useCallback((conversationId) => {
    setActiveConversationId(conversationId);
    
    // Charger les messages si pas encore chargés
    if (!messages[conversationId]) {
      loadMessages(conversationId);
    }

    // Marquer les messages comme lus
    markAsRead(conversationId);
  }, [messages, loadMessages]);

  // Marquer les messages comme lus
  const markAsRead = useCallback(async (conversationId) => {
  if (!token) return;

  try {
    await request(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/user-relations/conversations/${conversationId}/messages/read`,
      'PUT',
      null,
      true
    );

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );

    setUnreadCount(prev => prev); // OU recalcul global ailleurs
  } catch (error) {
    console.error('❌ Erreur lors du marquage comme lu:', error);
  }
}, [token]);

  // Envoyer un message via WebSocket
  const sendMessage = useCallback((conversationId, content) => {
    if (!content.trim()) return;

    const success = websocket.sendMessage(conversationId, content);
    
    if (!success) {
      console.warn('⚠️ Message non envoyé (WebSocket déconnecté), tentative via HTTP...');
      
      // Fallback : envoi via HTTP
      request(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user-relations/conversations/messages`,
        'POST',
        { conversationId, content },
        true
      ).then(() => {
        loadMessages(conversationId);
      });
    }
  }, [websocket, loadMessages]);

  // S'abonner aux messages temps réel d'une conversation
  useEffect(() => {
    if (!activeConversationId || !websocket.connected) return;

    console.log(`📡 Abonnement à la conversation ${activeConversationId}`);

    const subscription = websocket.subscribeToConversation(
      activeConversationId,
      (newMessage) => {
        console.log('📨 Nouveau message reçu:', newMessage);
        
        setMessages(prev => ({
          ...prev,
          [activeConversationId]: [
            ...(prev[activeConversationId] || []),
            newMessage,
          ],
        }));

        // Mettre à jour la liste des conversations (dernier message)
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? { ...conv, lastMessage: newMessage, lastMessageAt: newMessage.createdAt }
              : conv
          )
        );
      }
    );

    // Abonnement aux notifications "typing"
    const typingSub = websocket.subscribeToTyping(
      activeConversationId,
      (notification) => {
        setTypingUsers(prev => {
          const current = prev[activeConversationId] || [];
          
          if (notification.isTyping) {
            // Ajouter l'utilisateur
            return {
              ...prev,
              [activeConversationId]: [...current, notification.userId],
            };
          } else {
            // Retirer l'utilisateur
            return {
              ...prev,
              [activeConversationId]: current.filter(id => id !== notification.userId),
            };
          }
        });
      }
    );

    // Nettoyage
    return () => {
      console.log(`🔌 Désabonnement de la conversation ${activeConversationId}`);
      websocket.unsubscribeFromConversation(activeConversationId);
      if (subscription) subscription.unsubscribe();
      if (typingSub) typingSub.unsubscribe();
    };
  }, [activeConversationId, websocket.connected]);

  // S'abonner aux statuts utilisateurs
  useEffect(() => {
    if (!websocket.connected) return;

    const subscription = websocket.subscribeToUserStatus((status) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (status.status === 'ONLINE') {
          updated.add(status.userId);
        } else {
          updated.delete(status.userId);
        }
        return updated;
      });
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [websocket.connected]);

  // Charger les conversations quand shouldLoad change
  useEffect(() => {
    if (shouldLoad) {
      loadConversations();
    }
  }, [shouldLoad, loadConversations]);

  const value = {
    // États
    conversations,
    activeConversationId,
    messages: messages[activeConversationId] || [],
    allMessages: messages,
    unreadCount,
    typingUsers: typingUsers[activeConversationId] || [],
    onlineUsers,
    loading,
    websocketConnected: websocket.connected,

    // Actions
    loadConversations,
    loadMessages,
    selectConversation,
    sendMessage,
    markAsRead,
    sendTypingNotification: websocket.sendTypingNotification,
    updateStatus: websocket.updateStatus,
    setActiveConversationId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}