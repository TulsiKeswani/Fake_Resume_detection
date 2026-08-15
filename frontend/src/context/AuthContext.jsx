import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('intellify_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load active user profile on app load if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          setUser(res.user);
          setRole(res.role);
        }
      } catch (err) {
        console.error('Session validation error:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Universal Login function
  const login = async (email, password, userRole) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password, role: userRole });
      if (res.success) {
        localStorage.setItem('intellify_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setRole(res.user.role);
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register Company function
  const registerCompany = async (formData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register/company', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.success) {
        localStorage.setItem('intellify_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setRole('company');
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register Candidate Multi-step function with Cloud file streaming
  const registerCandidate = async (formData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register/candidate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.success) {
        localStorage.setItem('intellify_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setRole('candidate');
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('intellify_token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        error,
        login,
        registerCompany,
        registerCandidate,
        logout,
        setError,
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
