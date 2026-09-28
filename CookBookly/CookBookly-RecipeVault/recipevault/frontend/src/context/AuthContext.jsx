import React, { createContext, useContext, useState } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cookbookly_user');
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = (authResponse) => {
    localStorage.setItem('cookbookly_token', authResponse.token);
    const userInfo = { id: authResponse.userId, name: authResponse.name, email: authResponse.email };
    localStorage.setItem('cookbookly_user', JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persistSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('cookbookly_token');
    localStorage.removeItem('cookbookly_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
