import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { decodeToken } from '@/lib/auth';

const SOCKET_URL = import.meta.env.VITE_NOTIFICATION_SOCKET_URL || 'http://localhost:9095';

export const useSocketNotifications = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.id) return;

    // Initialize socket connection with auth token
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('📡 Connected to Real-time Notification Service');
    });

    socket.on('new_notification', (notification) => {
      console.log('🔔 New notification received:', notification);
      
      // Display a beautiful toast based on status
      const title = notification.statut === 'VALIDÉ' ? 'Support Validé ! ✅' :
                    notification.statut === 'REJETÉ' ? 'Support Rejeté ❌' :
                    'Mise à jour support ℹ️';

      toast(title, {
        description: `Le cours "${notification.titre}" (${notification.matiere}) a été mis à jour.`,
        action: {
          label: 'Voir',
          onClick: () => window.location.href = '/dashboard/notifications'
        },
      });

      // Dispatch a custom event to notify components that data should be refreshed
      window.dispatchEvent(new CustomEvent('notification_received', { detail: notification }));
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Connection error to notification service:', err.message);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return socketRef.current;
};
