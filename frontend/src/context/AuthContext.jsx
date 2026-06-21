import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Session validation failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      
      // Fetch user profile
      const userRes = await api.get('/api/auth/me');
      setUser(userRes.data);
      localStorage.setItem('user', JSON.stringify(userRes.data));
      setLoading(false);
      return userRes.data;
    } catch (err) {
      setLoading(false);
      throw err.response?.data?.detail || 'Login failed. Please check credentials.';
    }
  };

  const googleLogin = async (credential) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/google', { credential });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      
      const userRes = await api.get('/api/auth/me');
      setUser(userRes.data);
      localStorage.setItem('user', JSON.stringify(userRes.data));
      setLoading(false);
      return userRes.data;
    } catch (err) {
      setLoading(false);
      throw err.response?.data?.detail || 'Google authentication failed.';
    }
  };

  const registerUser = async (email, password) => {
    setLoading(true);
    try {
      await api.post('/api/auth/register', { email, password });
      setLoading(false);
      // Auto login after registration
      return await login(email, password);
    } catch (err) {
      setLoading(false);
      throw err.response?.data?.detail || 'Registration failed.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    googleLogin,
    registerUser,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
