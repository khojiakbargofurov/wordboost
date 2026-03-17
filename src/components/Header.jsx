import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import { User } from 'lucide-react';
import './Header.css';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="app-header glass">
      <div className="header-left">
        {/* Placeholder for breadcrumbs or page title if needed */}
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
