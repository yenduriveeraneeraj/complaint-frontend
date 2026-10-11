import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('cms_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('cms_token', token);
      localStorage.setItem('cms_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_refresh_token');
      localStorage.removeItem('cms_user');
    }
  }, [token, user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const data = response.data;
      
      const userData = {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
      };

      setToken(data.token);
      if (data.refreshToken) {
        localStorage.setItem('cms_refresh_token', data.refreshToken);
      }
      setUser(userData);
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      const data = error.response?.data;
      let message = 'Registration failed. Please check your details.';
      if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
        message = Object.entries(data.fieldErrors)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join(' | ');
      } else if (data?.message) {
        message = data.message;
      } else if (typeof data === 'string' && data.trim().length > 0) {
        message = data;
      }
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_refresh_token');
    localStorage.removeItem('cms_user');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isStaff = user?.role === 'ROLE_STAFF';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
