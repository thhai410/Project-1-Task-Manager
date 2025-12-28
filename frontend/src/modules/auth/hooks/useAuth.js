import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { loginApi, registerApi, meApi, logoutApi } from '../services/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const me = await meApi();
        setUser(me.data); // Chỉ lấy data từ response
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const data = await loginApi({ email, password });
    if (data?.data?.accessToken) localStorage.setItem('access_token', data.data.accessToken);
    if (data?.data?.refreshToken) localStorage.setItem('refresh_token', data.data.refreshToken);
    const me = await meApi();
    setUser(me.data); // Chỉ lấy data từ response
    return me.data;
  };

  const register = async (payload) => {
    await registerApi(payload);
    return await login(payload.email, payload.password);
  };

  const logout = async () => {
    try { await logoutApi(); } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
