import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import Card from '../components/Card';
import { notificationService } from '../services/notificationService';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSeenTime, setLastSeenTime] = useState(0);

  useEffect(() => {
    // Load last seen time before fetching to know which ones were initially unread
    const storedDate = localStorage.getItem('lastSeenNotificationDate');
    if (storedDate) {
      setLastSeenTime(new Date(storedDate).getTime());
    }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getRecentNotifications(50);
      setNotifications(data);
      
      if (data.length > 0 && data[0].createdAt) {
        localStorage.setItem('lastSeenNotificationDate', data[0].createdAt.toISOString());
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle size={24} className="text-yellow-500" />;
      case 'success': return <CheckCircle2 size={24} className="text-green-500" />;
      default: return <Info size={24} className="text-blue-500" />;
    }
  };

  return (
    <div className="notifications-page-container fade-in">
      <header className="page-header mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell size={28} className="text-primary" />
          Bildirishnomalar
        </h1>
        <p className="text-muted mt-2">So'nggi yangiliklar va tizim xabarlari.</p>
      </header>

      {loading ? (
        <div className="text-center text-muted p-8">Yuklanmoqda...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center text-muted glass rounded-2xl w-full max-w-2xl mx-auto">
          <Bell size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Hali xabarlar mavjud emas.</p>
        </div>
      ) : (
        <div className="user-notifications-list">
          {notifications.map((n) => {
            const isUnread = new Date(n.createdAt).getTime() > lastSeenTime;
            return (
              <Card key={n.id} className={`user-notification-card glass-card ${isUnread ? 'unread-notification' : ''}`}>
                <div className="flex gap-4 relative">
                  {isUnread && <span className="absolute -left-2 -top-2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_var(--red-500)]"></span>}
                  <div className={`type-icon-wrapper large mt-1 ${isUnread ? 'highlight' : ''}`}>
                    {getTypeIcon(n.type)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-xl mb-2 ${isUnread ? 'text-white' : 'text-white/80'}`}>{n.title}</h3>
                    <p className={`text-base leading-relaxed mb-3 ${isUnread ? 'text-main/90' : 'text-muted'}`}>{n.message}</p>
                    <span className="text-xs text-muted font-medium">
                      {n.createdAt?.toLocaleString('uz-UZ') || 'Hozirgina'}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
