import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
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
    const userCredential = await signInWithPopup(auth, provider);
    await handleUserRoles(userCredential.user, { role });
    return userCredential;
  }

  function logout() {
    setUserData(null);
    setUserRole(null);
    return signOut(auth);
  }

  useEffect(() => {
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
