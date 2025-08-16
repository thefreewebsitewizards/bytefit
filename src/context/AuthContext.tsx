import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { auth } from '../config/firebase';
import { loginUser, registerUser, logoutUser, getUserProfile, UserProfile } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Get user profile from Firestore
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        setIsAdmin(profile?.role === 'admin' || profile?.userType === 'admin' || false);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    
    if (result.success) {
      toast.success('👋 Welcome back! Successfully logged in.');
    } else {
      toast.error('❌ ' + (result.error || 'Login failed. Please try again.'));
    }
    
    return result;
  };

  const register = async (email: string, password: string, name?: string) => {
    const result = await registerUser(email, password, name);
    
    if (result.success) {
      toast.success(`🎉 Welcome ${name || 'User'}! Account created successfully.`);
    } else {
      toast.error('❌ ' + (result.error || 'Registration failed. Please try again.'));
    }
    
    return result;
  };

  const logout = async () => {
    try {
      await logoutUser();
      toast.success('👋 Successfully logged out. See you soon!');
    } catch (error) {
      toast.error('❌ Error logging out. Please try again.');
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};