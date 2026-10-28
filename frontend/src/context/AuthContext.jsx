import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('stockflow_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stockflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [organization, setOrganization] = useState(() => {
    const saved = localStorage.getItem('stockflow_org');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('stockflow_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setOrganization(res.organization);
          localStorage.setItem('stockflow_user', JSON.stringify(res.user));
          if (res.organization) {
            localStorage.setItem('stockflow_org', JSON.stringify(res.organization));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('stockflow_auth_expired', handleAuthExpired);
    verifySession();

    return () => {
      window.removeEventListener('stockflow_auth_expired', handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('stockflow_token', data.token);
    localStorage.setItem('stockflow_user', JSON.stringify(data.user));
    if (data.organization) {
      localStorage.setItem('stockflow_org', JSON.stringify(data.organization));
    }
    setToken(data.token);
    setUser(data.user);
    setOrganization(data.organization);
    return data;
  };

  const register = async (organizationName, email, password, name = '') => {
    const data = await api.register({ organizationName, email, password, name });
    localStorage.setItem('stockflow_token', data.token);
    localStorage.setItem('stockflow_user', JSON.stringify(data.user));
    if (data.organization) {
      localStorage.setItem('stockflow_org', JSON.stringify(data.organization));
    }
    setToken(data.token);
    setUser(data.user);
    setOrganization(data.organization);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_user');
    localStorage.removeItem('stockflow_org');
    setToken(null);
    setUser(null);
    setOrganization(null);
  };

  const updateOrganizationState = (updatedOrg) => {
    setOrganization(updatedOrg);
    localStorage.setItem('stockflow_org', JSON.stringify(updatedOrg));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        organization,
        loading,
        isAuthenticated: !!token,
        isAdmin,
        login,
        register,
        logout,
        updateOrganizationState,
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
