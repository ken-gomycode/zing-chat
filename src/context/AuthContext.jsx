import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthChange, getUserProfile, logoutUser } from '../services/auth';
import { setupPresence } from '../services/presence';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const presenceCleanupRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (presenceCleanupRef.current) {
        presenceCleanupRef.current();
        presenceCleanupRef.current = null;
      }

      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);

        presenceCleanupRef.current = setupPresence(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (presenceCleanupRef.current) {
        presenceCleanupRef.current();
      }
    };
  }, []);

  const logout = async () => {
    if (presenceCleanupRef.current) {
      presenceCleanupRef.current();
      presenceCleanupRef.current = null;
    }
    await logoutUser();
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
