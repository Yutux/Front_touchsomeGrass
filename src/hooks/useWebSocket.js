import { useEffect, useRef, useCallback, useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../components/contexts/UserContext/UserContext';
import websocketService from '../components/utils/websocket';

/**
 * Hook pour gérer la connexion WebSocket
 * 
 * @returns {Object} { connected, sendMessage, subscribeToConversation, etc. }
 */
export default function useWebSocket() {
  const { token } = useContext(UserContext);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Connexion au WebSocket
  const connect = useCallback(() => {
    if (!token) {
      console.warn('⚠️ Pas de token, impossible de se connecter au WebSocket');
      return;
    }

    console.log('🔌 Tentative de connexion WebSocket...');

    websocketService.connect(
      token,
      // onConnected
      () => {
        console.log('✅ WebSocket connecté avec succès');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      },
      // onError
      (err) => {
        console.error('❌ Erreur WebSocket:', err);
        setConnected(false);
        setError(err);

        // Tentative de reconnexion automatique
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          console.log(`🔄 Reconnexion dans ${delay / 1000}s (tentative ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
        }
      }
    );
  }, [token]);

  // Déconnexion
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    websocketService.disconnect();
    setConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Envoyer un message
  const sendMessage = useCallback((conversationId, content) => {
    if (!connected) {
      console.warn('⚠️ WebSocket non connecté, impossible d\'envoyer le message');
      return false;
    }
    websocketService.sendMessage(conversationId, content);
    return true;
  }, [connected]);

  // S'abonner à une conversation
  const subscribeToConversation = useCallback((conversationId, callback) => {
    if (!connected) {
      console.warn('⚠️ WebSocket non connecté, impossible de s\'abonner');
      return null;
    }
    return websocketService.subscribeToConversation(conversationId, callback);
  }, [connected]);

  // Se désabonner d'une conversation
  const unsubscribeFromConversation = useCallback((conversationId) => {
    websocketService.unsubscribeFromConversation(conversationId);
  }, []);

  // S'abonner aux notifications "typing"
  const subscribeToTyping = useCallback((conversationId, callback) => {
    if (!connected) return null;
    return websocketService.subscribeToTyping(conversationId, callback);
  }, [connected]);

  // Envoyer une notification "typing"
  const sendTypingNotification = useCallback((conversationId, userId, username, isTyping) => {
    if (!connected) return;
    websocketService.sendTypingNotification(conversationId, userId, username, isTyping);
  }, [connected]);

  // S'abonner aux statuts utilisateurs
  const subscribeToUserStatus = useCallback((callback) => {
    if (!connected) return null;
    return websocketService.subscribeToUserStatus(callback);
  }, [connected]);

  // Mettre à jour son statut
  const updateStatus = useCallback((userId, username, status) => {
    if (!connected) return;
    websocketService.updateStatus(userId, username, status);
  }, [connected]);

  // Connexion automatique au montage
  useEffect(() => {
    if (token) {
      connect();
    }

    // Déconnexion au démontage
    return () => {
      disconnect();
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    connected,
    error,
    connect,
    disconnect,
    sendMessage,
    subscribeToConversation,
    unsubscribeFromConversation,
    subscribeToTyping,
    sendTypingNotification,
    subscribeToUserStatus,
    updateStatus,
  };
}