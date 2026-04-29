import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithCustomToken
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'student', 'teacher', 'admin'
  const [loading, setLoading] = useState(true);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  // Helper function to create or fetch user in Firestore
  const handleUserRoles = async (user, additionalData = {}) => {
    if (!user) {
      setUserData(null);
      setUserRole(null);
      return null;
    }
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // First time logging in (or signing up via Google)
      const role = additionalData.role || 'student'; // Default to student
      try {
        const newUserDoc = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || additionalData.displayName || '',
          role: role,
          createdAt: new Date(),
          xp: 0,
          level: 1,
          streak: 0,
          learnedWords: []
        };
        await setDoc(userRef, newUserDoc);
        setUserData(newUserDoc);
        setUserRole(role);
      } catch (error) {
        console.error("Error creating user document", error);
      }
    } else {
      // User exists, just set data and role state
      const data = userSnap.data();
      setUserData(data);
      setUserRole(data.role);
    }
  };

  // Function to manually refresh user data from Firestore
  const refreshUserData = async () => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      setUserData(data);
      setUserRole(data.role);
    }
  };

  async function signup(email, password, name, role = 'student') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await handleUserRoles(userCredential.user, { role, displayName: name });
    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle(role = 'student') {
    const provider = new GoogleAuthProvider();
    // signInWithRedirect ishlatamiz — COOP window.closed xatosidan xoli
    await signInWithRedirect(auth, provider);
    // Natija onAuthStateChanged orqali avtomatik uslanadi
  }

  function logout() {
    setUserData(null);
    setUserRole(null);
    return signOut(auth);
  }

  // Telegram Seamless Authentication Logic
  const handleTelegramAuth = async () => {
    try {
      const tg = window.Telegram?.WebApp;
      if (tg && tg.initDataUnsafe?.user) {
        setIsTelegramWebApp(true);
        tg.expand(); // Expand the web app to full height
        
        const tgUser = tg.initDataUnsafe.user;
        const initData = tg.initData;

        // Call our Node.js backend to verify data and get Firebase Custom Token
        try {
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const res = await fetch(`${backendUrl}/api/auth/telegram`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData, user: tgUser })
          });

          if (!res.ok) throw new Error('Failed to authenticate with Telegram backend');
          
          const { customToken } = await res.json();
          await signInWithCustomToken(auth, customToken);
          console.log("✅ Seamlessly logged in Telegram User:", tgUser.first_name);

        } catch (authErr) {
          console.error("Backend Auth Error:", authErr);
        }
      }
    } catch (error) {
      console.error("Telegram Auth Error:", error);
    }
  };

  useEffect(() => {
    // Check for Telegram Web App context on load
    handleTelegramAuth();

    // Google Redirect natijasini ushlash
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await handleUserRoles(result.user, { role: 'student' });
        }
      })
      .catch((error) => {
        console.error('Google redirect result error:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await handleUserRoles(user);
      } else {
        setUserData(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    userRole,
    isTelegramWebApp,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
