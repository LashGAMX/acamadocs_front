import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('acamadocs_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('acamadocs_token');
      if (token) {
        try {
          const res = await api.get('/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('acamadocs_user', JSON.stringify(res.data.user));
          }
        } catch {
          setUser(null);
          localStorage.removeItem('acamadocs_token');
          localStorage.removeItem('acamadocs_user');
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (correo, contrasena) => {
    const res = await api.post('/login', { correo, contrasena });
    if (res.data.success) {
      localStorage.setItem('acamadocs_token', res.data.token);
      localStorage.setItem('acamadocs_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Error al iniciar sesión');
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Ignorar error si ya expiró
    } finally {
      localStorage.removeItem('acamadocs_token');
      localStorage.removeItem('acamadocs_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const isAdmin = user?.is_admin || user?.rol === 'Administrador';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
