import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: 'customer' | 'admin') => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check if user session already exists
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('aura_auth_token');
        if (token) {
          const res = await api.getCurrentUser();
          setUser(res.user);
        } else {
          // Default to Elena Vance (customer demo) so the store immediately has an active session
          const res = await api.login('customer@aura.com', 'customer123');
          setUser(res.user);
        }
      } catch (err) {
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const demoLogin = async (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      const res = await api.login('admin@aura.com', 'admin123');
      setUser(res.user);
    } else {
      const res = await api.login('customer@aura.com', 'customer123');
      setUser(res.user);
    }
    setIsAuthModalOpen(false);
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const res = await api.register(data);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
