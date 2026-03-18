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

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getRecentNotifications(50);
      setNotifications(data);
      
      if (data.length > 0) {
        localStorage.setItem('lastSeenNotificationId', data[0].id);
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
          {notifications.map((n) => (
            <Card key={n.id} className="user-notification-card glass-card">
              <div className="flex gap-4">
                <div className="type-icon-wrapper large mt-1">
                  {getTypeIcon(n.type)}
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2 text-white">{n.title}</h3>
                  <p className="text-base text-main/90 leading-relaxed mb-3">{n.message}</p>
                  <span className="text-xs text-muted font-medium">
                    {n.createdAt?.toLocaleString('uz-UZ') || 'Hozirgina'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
