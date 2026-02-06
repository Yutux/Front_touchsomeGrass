// src/contexts/FriendRequestsContext/FriendRequestsContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext/UserContext'; 
import request from '../../utils/request';

export const FriendRequestsContext = createContext();

export function FriendRequestsProvider({ children }) {
  const { token } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Charger le nombre de demandes d'ami reçues PENDING
  const loadUnreadCount = async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await request(
        'http://localhost:8088/api/v1/friend-requests/received/count',
        'GET',
        null,
        true
      );

      if (response.status === 200 && typeof response.data?.count === 'number') {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('❌ Erreur chargement compteur demandes d\'ami:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et quand le token change
  useEffect(() => {
    loadUnreadCount();
  }, [token]);

  // Rafraîchir toutes les 30 secondes
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const value = {
    unreadCount,
    loading,
    decrementUnread: () => setUnreadCount((prev) => Math.max(0, prev - 1)),
    incrementUnread: () => setUnreadCount((prev) => prev + 1),
    refresh: loadUnreadCount,
  };

  return (
    <FriendRequestsContext.Provider value={value}>
      {children}
    </FriendRequestsContext.Provider>
  );
}

// Hook personnalisé
export function useFriendRequests() {
  const context = useContext(FriendRequestsContext);
  if (!context) {
    throw new Error('useFriendRequests doit être utilisé dans FriendRequestsProvider');
  }
  return context;
}