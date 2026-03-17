import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminWordsPage from './pages/AdminWordsPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import DictionaryPage from './pages/DictionaryPage';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
        
        {/* Protected Routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/words" element={<AdminWordsPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
