import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import { User } from 'lucide-react';
import './Header.css';

export default function Header() {
  const { user } = useAuth();

  const currentDate = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  return (
    <header className="app-header glass">
      <div className="header-left flex flex-col justify-center">
        <h2 className="text-xl font-bold hidden md:block text-white">Xush kelibsiz 👋</h2>
        <p className="text-xs text-muted hidden lg:block mt-1">{currentDate}</p>
      </div>
      <div className="header-right">
        <NotificationCenter direction="top" />
        <div className="user-profile-mini">
          <div className="user-info text-right mr-3 hidden md:block">
            <p className="user-name font-bold text-sm">{user?.displayName || 'User'}</p>
            <p className="user-email text-[11px] text-muted">{user?.email}</p>
          </div>
          <div className="user-avatar rounded-full bg-primary/20 p-2 border border-primary/30">
            <User size={18} className="text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
