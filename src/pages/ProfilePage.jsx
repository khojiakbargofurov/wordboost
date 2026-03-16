import { useState } from 'react';
import { User, Mail, Shield, Bell, LogOut, Check } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import './ProfilePage.css';

function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: currentUser?.displayName || 'WordBoost User',
    email: currentUser?.email || 'No email provided',
    level: currentUser?.level || 'A1',
    joinDate: 'Joined recently',
    plan: 'Basic',
    notifications: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, level: user.level });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentUser?.uid) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          displayName: formData.name,
          level: formData.level
        });
      }
      setUser({ ...user, name: formData.name, level: formData.level });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="profile-page">
      <header className="profile-header mb-8">
        <h1>Profile Settings</h1>
        <p className="text-muted text-lg mt-2">Manage your account details and preferences.</p>
      </header>

      <div className="profile-grid">
        <div className="profile-main">
          {/* Personal Info */}
          <Card className="profile-card mb-6">
            <div className="card-header pb-4 border-b">
              <h3 className="m-0 flex items-center gap-2">
                <User size={20} className="text-primary" /> 
                Personal Information
              </h3>
            </div>
            
            <div className="card-body pt-6">
              {saveSuccess && (
                <div className="success-banner mb-6 fade-in">
                  <Check size={18} />
                  <span>Profile updated successfully</span>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSave} className="edit-form fade-in">
                  <div className="form-group mb-4">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ name: e.target.value })}
                      className="form-input"
                      autoFocus
                    />
                  </div>
                  <div className="form-group mb-4">
                    <label>Learning Level</label>
                    <div className="input-wrapper">
                      <select 
                        value={formData.level} 
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                      >
                        <option value="A1">A1 - Beginner</option>
                        <option value="A2">A2 - Elementary</option>
                        <option value="B1">B1 - Intermediate</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions flex gap-4">
                    <Button type="submit" variant="primary">Save Changes</Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <div className="info-display fade-in">
                  <div className="info-row mb-6">
                    <div className="info-label text-muted text-sm uppercase">Full Name</div>
                    <div className="info-value font-medium text-lg">{user.name}</div>
                  </div>
                  <div className="info-row mb-6">
                    <div className="info-label text-muted text-sm uppercase">Email Address</div>
                    <div className="info-value font-medium text-lg flex items-center gap-2">
                      {user.email} <span className="verified-badge">Verified</span>
                    </div>
                  </div>
                  <div className="info-row mb-6">
                    <div className="info-label text-muted text-sm uppercase">Learning Level</div>
                    <div className="info-value font-medium text-lg">{user.level || 'A1'} German</div>
                  </div>
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
              )}
            </div>
          </Card>

          {/* Preferences */}
          <Card className="profile-card">
            <div className="card-header pb-4 border-b">
              <h3 className="m-0 flex items-center gap-2">
                <Bell size={20} className="text-primary" /> 
                Preferences
              </h3>
            </div>
            <div className="card-body pt-6">
              <div className="toggle-row flex justify-between items-center pb-4 border-b">
                <div>
                  <h4 className="m-0 font-medium">Daily Reminders</h4>
                  <p className="text-muted text-sm m-0 mt-1">Receive daily emails to keep your streak alive.</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={user.notifications} 
                    onChange={() => setUser({...user, notifications: !user.notifications})} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar / Account Status */}
        <div className="profile-sidebar">
          <Card className="status-card mb-6" glow={true}>
            <div className="text-center">
              <div className="avatar-large mx-auto mb-4">{user.name.charAt(0)}</div>
              <h3 className="m-0">{user.name}</h3>
              <p className="text-muted text-sm mt-1 mb-6">Member since {user.joinDate}</p>
              
              <div className="plan-badge mb-6">
                <Shield size={16} />
                <span>{user.plan} Plan</span>
              </div>
              
              <Button variant="primary" fullWidth>Upgrade to Pro</Button>
            </div>
          </Card>

          <Card className="danger-card border-danger">
            <h4 className="text-danger m-0 mb-4 flex items-center gap-2">
              <Shield size={18} /> Danger Zone
            </h4>
            <div className="danger-actions flex flex-col gap-3">
              <Button onClick={handleLogout} variant="ghost" className="text-danger logout-btn justify-start" icon={LogOut}>
                Log Out
              </Button>
              <Button variant="danger" fullWidth>Delete Account</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
