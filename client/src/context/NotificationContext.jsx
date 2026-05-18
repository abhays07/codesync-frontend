import { createContext, useContext, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '../api/services/notificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.userId || user?.id;

  useEffect(() => {
    if (!userId || userId === 'undefined' || userId === 'null') return;

    const fetchNotifications = () => {
      getNotifications(userId).then(res => {
        const data = res.data || [];
        const sorted = data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setNotifications(sorted);
        setUnreadCount(sorted.filter(n => !n.read && !n.isRead).length);
      }).catch(err => console.error("Failed to fetch notifications", err));
    };

    fetchNotifications();

    const token = localStorage.getItem('token');
    
    let lastToastTime = 0;

    // Connect to WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_NOTIF_URL ?? 'http://3.108.1.211.nip.io:9000/ws-notifications', null, { withCredentials: true }),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('Connected to Notification WebSocket');
        client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
          if (message.body) {
            const notif = JSON.parse(message.body);
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Non-intrusive Live Toast Alert with Throttling (Debounce)
            const now = Date.now();
            if (now - lastToastTime > 1500) {
              lastToastTime = now;
              const icon = notif.type === 'COLLABORATION_REQUEST' ? '🤝' : '💬';
              toast(`${notif.senderName || 'System'}: ${notif.message || 'New Notification'}`, {
                icon,
                style: {
                  borderRadius: '10px',
                  background: '#1B1A55',
                  color: '#fff',
                },
              });
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userId]);

  const handleMarkAsRead = async (id, newType = null, newMessage = null) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true, isRead: true, type: newType || n.type, message: newMessage || n.message } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleRefresh = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const currentUserId = currentUser?.userId || currentUser?.id;
      if (!currentUserId || currentUserId === 'undefined') return;
      
      const res = await getNotifications(currentUserId);
      const data = res.data || [];
      const sorted = data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotifications(sorted);
      setUnreadCount(sorted.filter(n => !n.read && !n.isRead).length);
      toast.success("Refreshed");
    } catch (err) {
      toast.error("Failed to refresh");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const currentUserId = currentUser?.userId || currentUser?.id;
      if (!currentUserId || currentUserId === 'undefined') return;

      await markAllAsRead(currentUserId).catch(err => {
        if (err?.response?.status === 404) console.warn("Backend endpoint missing, updating locally");
        else throw err;
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
      setUnreadCount(0);
      toast.success("All marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id).catch(err => {
        if (err?.response?.status === 404) console.warn("Backend endpoint missing, deleting locally");
        else throw err;
      });
      setNotifications(prev => {
        const filtered = prev.filter(n => n.id !== id);
        setUnreadCount(filtered.filter(n => !n.read && !n.isRead).length);
        return filtered;
      });
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const currentUserId = currentUser?.userId || currentUser?.id;
      if (!currentUserId || currentUserId === 'undefined') return;

      await clearAllNotifications(currentUserId).catch(err => {
        if (err?.response?.status === 404) console.warn("Backend endpoint missing, clearing locally");
        else throw err;
      });
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Cleared all notifications");
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      handleMarkAsRead,
      handleRefresh,
      handleMarkAllAsRead,
      handleDeleteNotification,
      handleClearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
