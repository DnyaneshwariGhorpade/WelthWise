import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import {
  AuthUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  getProfile,
  refreshAuth,
} from '../services/auth.service';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: (reason?: string) => void;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string }>;
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
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback((reason?: string) => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    localStorage.removeItem('ww_token');
    localStorage.removeItem('ww_user');
    setUser(null);
    if (reason === 'timeout') {
      window.location.href = '/login?reason=timeout';
    }
  }, []);

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

  // Periodic silent token refresh every 10 minutes when logged in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const res = await refreshAuth();
        if (res?.token) {
          localStorage.setItem('ww_token', res.token);
        }
      } catch (err) {
        console.warn('Periodic token refresh skipped or failed:', err);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  // 15-Minute Client Inactivity Idle Listener
  useEffect(() => {
    if (!user) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        console.warn('[AUTH] Session timed out after 15 minutes of inactivity.');
        logout('timeout');
      }, IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'visibilitychange'];
    let lastCall = 0;

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle activity listener resets to at most once per 2 seconds
      if (now - lastCall > 2000) {
        lastCall = now;
        resetIdleTimer();
      }
    };

    resetIdleTimer();

    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
    };
  }, [user, logout]);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    localStorage.setItem('ww_token', res.token);
    localStorage.setItem('ww_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await registerUser(fullName, email, password);
    localStorage.setItem('ww_token', res.token);
    localStorage.setItem('ww_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const forgotPassword = async (email: string) => {
    return await requestPasswordReset(email);
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
