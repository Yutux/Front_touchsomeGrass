// src/contexts/NotificationsContext/NotificationsContext.jsx
// 🔥 VERSION UNIFIÉE avec GUARD : Invitations de groupe + Demandes d'ami

import { createContext, useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext/UserContext';
import request from '../../utils/request';

export const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const { token } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ Guard pour limiter les appels (utilise window.location)
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      const shouldLoadNow = token && (
        path.startsWith('/notifications') ||
        path.startsWith('/groups') ||
        path.startsWith('/friends') ||
        path.startsWith('/profile')
      );
      setShouldLoad(shouldLoadNow);
    };

    checkPath();

    // Écouter les changements de route
    window.addEventListener('popstate', checkPath);
    
    // Pour les navigations React Router
    const interval = setInterval(checkPath, 1000);

    return () => {
      window.removeEventListener('popstate', checkPath);
      clearInterval(interval);
    };
  }, [token]);

  // Charger le nombre total de notifications non lues
  const loadUnreadCount = async () => {
    if (!shouldLoad) { // ✅ Guard
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      // Charger les 2 compteurs en parallèle
      const [groupInvRes, friendReqRes] = await Promise.allSettled([
        request(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/user-relations/groups/invitations/pending/count`,
          'GET',
          null,
          true
        ),
        request(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/friend-requests/received/count`,
          'GET',
          null,
          true
        ),
      ]);

      let groupInvCount = 0;
      let friendReqCount = 0;

      if (groupInvRes.status === 'fulfilled' && typeof groupInvRes.value?.data?.count === 'number') {
        groupInvCount = groupInvRes.value.data.count;
      }

      if (friendReqRes.status === 'fulfilled' && typeof friendReqRes.value?.data?.count === 'number') {
        friendReqCount = friendReqRes.value.data.count;
      }

      // Total = invitations de groupe + demandes d'ami
      setUnreadCount(groupInvCount + friendReqCount);

    } catch (error) {
      console.error('❌ Erreur chargement compteur notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger quand shouldLoad change
  useEffect(() => {
    if (shouldLoad) {
      loadUnreadCount();
    } else {
      setUnreadCount(0); // Reset si on quitte les pages concernées
    }
  }, [shouldLoad]); 

  // Rafraîchir toutes les 30 secondes SEULEMENT si shouldLoad
  useEffect(() => {
    if (!shouldLoad) return; // ✅ Guard

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [shouldLoad]);

  const value = {
    unreadCount,
    loading,
    decrementUnread: () => setUnreadCount((prev) => Math.max(0, prev - 1)),
    incrementUnread: () => setUnreadCount((prev) => prev + 1),
    refresh: loadUnreadCount,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// Hook personnalisé
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans NotificationsProvider');
  }
  return context;
}