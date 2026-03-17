import { useState, useEffect, useRef } from 'react';
import { Bell, Info, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import './NotificationCenter.css';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Set up a periodic check every 5 minutes (simple polling for demo, ideally use onSnapshot)
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getRecentNotifications(10);
      setNotifications(data);
      
      // Simple unread logic (stored in local storage based on last seen ID)
      const lastSeenId = localStorage.getItem('lastSeenNotificationId');
      if (data.length > 0 && data[0].id !== lastSeenId) {
        // Find index of last seen
        const index = data.findIndex(n => n.id === lastSeenId);
        setUnreadCount(index === -1 ? data.length : index);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && notifications.length > 0) {
      localStorage.setItem('lastSeenNotificationId', notifications[0].id);
      setUnreadCount(0);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle size={14} className="text-yellow-500" />;
      case 'success': return <CheckCircle2 size={14} className="text-green-500" />;
      default: return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="notification-center-container" ref={dropdownRef}>
      <button 
        className={`notification-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={toggleDropdown}
        aria-label="Bildirishnomalar"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown glass">
          <div className="dropdown-header">
            <h3>Bildirishnomalar</h3>
            <span className="text-xs text-muted">{notifications.length} ta xabar</span>
          </div>
          <div className="notifications-list-mini">
            {notifications.length === 0 ? (
              <div className="no-notifications p-4 text-center text-sm text-muted">
                Xabarlar mavjud emas.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="mini-notification-item">
                  <div className="flex gap-2">
                    <div className="mt-1">{getTypeIcon(n.type)}</div>
                    <div className="flex-1">
                      <p className="mini-title font-bold text-sm">{n.title}</p>
                      <p className="mini-message text-xs text-muted line-clamp-2">{n.message}</p>
                      <span className="mini-date text-[9px] text-muted/60 mt-1 block">
                        {n.createdAt?.toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
