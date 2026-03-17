import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, Trash2, Bell, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { notificationService } from '../services/notificationService';
import './AdminNotificationsPage.css';

export default function AdminNotificationsPage() {
  const { userRole, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchNotifications();
  }, [userRole, navigate]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getRecentNotifications(20);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    setSending(true);
    try {
      await notificationService.sendBroadcast({
        ...formData,
        authorId: user.uid
      });
      setFormData({ title: '', message: '', type: 'info' });
      await fetchNotifications();
      alert("Xabar muvaffaqiyatli yuborildi!");
    } catch (error) {
      alert("Xabar yuborishda xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ushbu bildirishnomani o'chirib tashlamoqchimisiz?")) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle size={18} className="text-yellow-500" />;
      case 'success': return <CheckCircle2 size={18} className="text-green-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  if (userRole !== 'admin') return null;

  return (
    <div className="admin-notifications-container fade-in">
      <header className="admin-header mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell size={28} className="text-primary" />
          Broadcast Notifications
        </h1>
        <p className="text-muted mt-2">Barcha foydalanuvchilarga bildirishnomalar yuboring.</p>
      </header>

      <div className="notifications-grid">
        <section className="send-form-section">
          <Card className="sticky-form">
            <form onSubmit={handleSendBroadcast} className="broadcast-form">
              <h3 className="text-xl font-semibold mb-4">Yangi bildirishnoma</h3>
              
              <div className="form-group mb-4">
                <label>Sarlavha</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Masalan: Yangi so'zlar qo'shildi!"
                />
              </div>

              <div className="form-group mb-4">
                <label>Tur (Type)</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="info">Ma'lumot (Info)</option>
                  <option value="success">Muvaffaqiyat (Success)</option>
                  <option value="warning">Ogohlantirish (Warning)</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <label>Xabar matni</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-input textarea"
                  placeholder="Xabarni shu yerga yozing..."
                  rows="4"
                ></textarea>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full" 
                disabled={sending}
                icon={Send}
              >
                {sending ? 'Yuborilmoqda...' : 'Hozir yuborish'}
              </Button>
            </form>
          </Card>
        </section>

        <section className="history-section">
          <h3 className="text-xl font-semibold mb-4">Yuborilgan xabarlar</h3>
          {loading ? (
            <div className="p-8 text-center text-muted">Yuklanmoqda...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted glass rounded-xl">Hali xabarlar yuborilmagan.</div>
          ) : (
            <div className="notifications-list">
              {notifications.map((n) => (
                <Card key={n.id} className="notification-history-item mb-4 glass-card">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="type-icon-wrapper mt-1">
                        {getTypeIcon(n.type)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{n.title}</h4>
                        <p className="text-sm text-main/90 mt-1">{n.message}</p>
                        <span className="text-[10px] text-muted block mt-2">
                          {n.createdAt?.toLocaleString('uz-UZ') || 'Hozirgina'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(n.id)}
                      className="delete-item-btn p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
