import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { User, Shield, GraduationCap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import './AdminUsersPage.css';

export default function AdminUsersPage() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic protection (better done in a ProtectedRoute component generally)
    if (userRole && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const usersCol = collection(db, 'users');
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userRole, navigate]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      
      // Update local state to reflect UI change immediately
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role. Check permissions.");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={16} className="text-secondary" style={{ color: '#F5A623' }} />;
      case 'teacher': return <GraduationCap size={16} className="text-primary" />;
      default: return <User size={16} className="text-muted" />;
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <h2>Loading users...</h2>
      </div>
    );
  }

  // Prevent UI flashing if navigating away
  if (userRole !== 'admin') return null;

  return (
    <div className="admin-container fade-in">
      <header className="admin-header mb-8">
        <div>
          <button onClick={() => navigate('/dashboard')} className="icon-button mb-4 bg-card" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-muted mt-2">View and change user roles.</p>
        </div>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>XP / Lvl</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-name-cell">
                      <div className="avatar-placeholder">{user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}</div>
                      <span>{user.displayName || 'Unnamed User'}</span>
                    </div>
                  </td>
                  <td className="text-muted">{user.email}</td>
                  <td>
                    <span className="badge bg-primary/20 text-primary">{user.xp || 0} XP</span>
                    <span className="text-muted text-sm ml-2">Lvl {user.level || 1}</span>
                  </td>
                  <td>
                    <div className="role-select-wrapper">
                      {getRoleIcon(user.role)}
                      <select 
                        value={user.role || 'student'} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-muted">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
