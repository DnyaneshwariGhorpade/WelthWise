import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AuthUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  getProfile,
} from '../services/auth.service';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<string>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('ww_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    const token = localStorage.getItem('ww_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await getProfile();
      setUser(profile);
      localStorage.setItem('ww_user', JSON.stringify(profile));
    } catch {
      localStorage.removeItem('ww_token');
      localStorage.removeItem('ww_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    localStorage.setItem('ww_token', res.token);
    localStorage.setItem('ww_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await registerUser(fullName, email, password);
    localStorage.setItem('ww_token', res.token);
    localStorage.setItem('ww_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('ww_token');
    localStorage.removeItem('ww_user');
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    const res = await requestPasswordReset(email);
    return res.message;
  };

  const resetPwd = async (token: string, password: string) => {
    const res = await resetPassword(token, password);
    return res.message;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword: resetPwd,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
