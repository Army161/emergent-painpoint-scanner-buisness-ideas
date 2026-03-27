import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import IdeaDetail from './components/IdeaDetail';
import SavedIdeas from './components/SavedIdeas';
import Pricing from './components/Pricing';
import PaymentSuccess from './components/PaymentSuccess';
import { Toaster } from 'sonner';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export const apiClient = axios.create({ baseURL: API_BASE });
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('idearadar_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('idearadar_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('idearadar_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const token = localStorage.getItem('idearadar_token');
    if (token) {
      apiClient.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('idearadar_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('idearadar_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('idearadar_token');
    setUser(null);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, setUser, login, logout }}>
        <Toaster theme={theme} position="bottom-right" richColors />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/idea/:id" element={<ProtectedRoute><IdeaDetail /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedIdeas /></ProtectedRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
