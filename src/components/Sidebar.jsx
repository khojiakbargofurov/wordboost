import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, PlayCircle, Trophy, User, Shield, BookOpen, Search, Menu, X, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import './Sidebar.css';

function Sidebar() {
  const { userRole } = useAuth();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(o => !o);
  const close  = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <div className="sidebar-logo compact">
          <div className="logo-icon">W</div>
          <span className="logo-text">WordBoost</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter direction="top" />
          <button className="hamburger-btn" onClick={toggle} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={close} />}

      {/* Sidebar panel */}
      <aside className={`sidebar glass${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">W</div>
          <span className="logo-text">WordBoost</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard"  className="nav-item" onClick={close}><Home size={20} /><span>Dashboard</span></NavLink>
          <NavLink to="/flashcards" className="nav-item" onClick={close}><Layers size={20} /><span>Flashcards</span></NavLink>
          <NavLink to="/quiz"       className="nav-item" onClick={close}><PlayCircle size={20} /><span>Quizzes</span></NavLink>
          <NavLink to="/dictionary" className="nav-item" onClick={close}><Search size={20} /><span>Dictionary</span></NavLink>
          <NavLink to="/progress"   className="nav-item" onClick={close}><Trophy size={20} /><span>Leaderboard</span></NavLink>
        </nav>

        <div className="sidebar-bottom">
          {(userRole === 'admin' || userRole === 'teacher') && (
            <NavLink to="/admin/words" className="nav-item admin-link" onClick={close}>
              <BookOpen size={20} /><span>Manage Words</span>
            </NavLink>
          )}
          {userRole === 'admin' && (
            <NavLink to="/admin/users" className="nav-item admin-link" onClick={close}>
              <Shield size={20} /><span>Manage Users</span>
            </NavLink>
          )}
          {userRole === 'admin' && (
            <NavLink to="/admin/notifications" className="nav-item admin-link" onClick={close}>
              <Megaphone size={20} /><span>Broadcast</span>
            </NavLink>
          )}
          <NavLink to="/profile" className="nav-item" onClick={close}>
            <User size={20} /><span>Profile</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
