import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(token, onConnected, onError) {
    const socket = new SockJS('http://localhost:8088/ws');  // ✅ Via Gateway

    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('[STOMP Debug]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket connecté');
        this.connected = true;
        onConnected?.();
      },
      onStompError: (frame) => {
        console.error('❌ Erreur STOMP:', frame);
        this.connected = false;
        onError?.(frame);
      },
      onWebSocketClose: () => {
        console.log('🔌 WebSocket déconnecté');
        this.connected = false;
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
      console.log('🔌 WebSocket manuellement déconnecté');
    }
  }

  // ✅ Envoyer un message - CORRIGÉ
  sendMessage(conversationId, content) {
    if (!this.connected || !this.client) {
      console.warn('⚠️ WebSocket non connecté');
      return false;
    }

    console.log('📤 Envoi message vers conversation', conversationId);

    try {
      this.client.publish({
        destination: `/app/chat/${conversationId}`,  // ✅ CORRIGÉ
        body: JSON.stringify({
          content,
          type: 'TEXT',
        }),
      });
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return false;
    }
  }

  // S'abonner aux messages d'une conversation
  subscribeToConversation(conversationId, callback) {
    if (!this.connected || !this.client) {
      console.warn('⚠️ WebSocket non connecté');
      return null;
    }

    const subscription = this.client.subscribe(
      `/topic/conversation/${conversationId}`,
      (message) => {
        const parsedMessage = JSON.parse(message.body);
        console.log('📨 Message reçu:', parsedMessage);
        callback(parsedMessage);
      }
    );

    this.subscriptions.set(`conversation-${conversationId}`, subscription);
    console.log(`✅ Abonné à /topic/conversation/${conversationId}`);
    return subscription;
  }

  // S'abonner aux notifications "typing"
  subscribeToTyping(conversationId, callback) {
    if (!this.connected || !this.client) return null;

    const subscription = this.client.subscribe(
      `/topic/conversation/${conversationId}/typing`,
      (message) => {
        const notification = JSON.parse(message.body);
        callback(notification);
      }
    );

    this.subscriptions.set(`typing-${conversationId}`, subscription);
    return subscription;
  }

  // Envoyer une notification "typing"
  sendTypingNotification(conversationId, userId, username, isTyping) {
    if (!this.connected || !this.client) return;

    this.client.publish({
      destination: `/app/chat/${conversationId}/typing`,  // ✅ CORRIGÉ
      body: JSON.stringify({
        conversationId,
        userId,
        username,
        isTyping,
      }),
    });
  }

  // S'abonner aux statuts utilisateurs
  subscribeToUserStatus(callback) {
    if (!this.connected || !this.client) return null;

    const subscription = this.client.subscribe('/topic/user.status', (message) => {
      const status = JSON.parse(message.body);
      callback(status);
    });

    this.subscriptions.set('user-status', subscription);
    return subscription;
  }

  // Mettre à jour son statut
  updateStatus(userId, username, status) {
    if (!this.connected || !this.client) return;

    this.client.publish({
      destination: '/app/user.status',
      body: JSON.stringify({
        userId,
        username,
        status,
        lastSeen: Date.now(),
      }),
    });
  }

  // Se désabonner d'une conversation
  unsubscribeFromConversation(conversationId) {
    const conversationSub = this.subscriptions.get(`conversation-${conversationId}`);
    const typingSub = this.subscriptions.get(`typing-${conversationId}`);
    
    if (conversationSub) {
      conversationSub.unsubscribe();
      this.subscriptions.delete(`conversation-${conversationId}`);
    }
    
    if (typingSub) {
      typingSub.unsubscribe();
      this.subscriptions.delete(`typing-${conversationId}`);
    }
    
    console.log(`🔌 Désabonné de la conversation ${conversationId}`);
  }
}

export default new WebSocketService();