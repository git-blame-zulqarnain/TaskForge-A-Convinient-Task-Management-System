import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { getMyNotifications, markNotificationsAsReadService, markAllNotificationsAsReadService } from '../services/notificationService';
import { toast } from 'react-toastify'; 

const NotificationItem = ({ notification, onMarkOneAsRead }) => (
  <li className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
    <p>{notification.message}</p>
    <small>
      {new Date(notification.createdAt).toLocaleString()}
      {!notification.isRead && (
        <button onClick={() => onMarkOneAsRead(notification._id)} className="mark-one-read-btn">
          Mark as read
        </button>
      )}
    </small>
  </li>
);


const NotificationBell = () => {
  const { authState, getSocketInstance } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    setIsLoading(true);
    try {
      const fetchedNotifications = await getMyNotifications();
      setNotifications(fetchedNotifications || []);
    } catch (error) {
      console.error("NotificationBell: Failed to fetch notifications", error);
      toast.error("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    fetchNotifications(); 
  }, [fetchNotifications]);


  useEffect(() => {
    if (authState.isAuthenticated && authState.user?._id) {
      const socket = getSocketInstance();
      if (socket) {
        const handleNewNotification = (eventData) => { 
          console.log("NotificationBell: Socket event received, new notification (taskShared or statusUpdated)", eventData);
          fetchNotifications(); 
        };

        socket.on('newTaskShared', handleNewNotification);
        socket.on('taskStatusUpdated', handleNewNotification);

        return () => {
          socket.off('newTaskShared', handleNewNotification);
          socket.off('taskStatusUpdated', handleNewNotification);
        };
      }
    }
  }, [authState.isAuthenticated, authState.user?._id, getSocketInstance, fetchNotifications]);


  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
    if (!showDropdown) { 
      fetchNotifications();
    }
  };

  const handleMarkOneAsRead = async (notificationId) => {
    try {
      await markNotificationsAsReadService([notificationId]);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
      toast.success("Notification marked as read.");
    } catch (error) {
      toast.error("Failed to mark notification as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllNotificationsAsReadService();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error("Failed to mark all notifications as read.");
    }
  };

  if (!authState.isAuthenticated) return null; 

  return (
    <div className="notification-bell-container">
      <button onClick={toggleDropdown} className="notification-bell-button" aria-label="Toggle notifications">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width: '1.5em', height: '1.5em'}}>
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown glass-card" style={{minWidth: '300px', maxHeight: '400px', overflowY: 'auto'}}>
          <div className="notification-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="mark-all-read-btn">Mark all as read</button>
            )}
          </div>
          {isLoading && notifications.length === 0 && <p className="loading-text" style={{padding: '1rem'}}>Loading...</p>}
          {!isLoading && notifications.length === 0 && <p className="no-notifications-text">No notifications yet.</p>}
          {notifications.length > 0 && (
            <ul>
              {notifications.map(notif => (
                <NotificationItem key={notif._id} notification={notif} onMarkOneAsRead={handleMarkOneAsRead} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;