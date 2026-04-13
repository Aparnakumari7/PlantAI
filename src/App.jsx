import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import History from './pages/History';
import ContactPage from './components/ContactPage';
import PrivacyPage from './components/PrivacyPage';
import DisclaimerPage from './components/DisclaimerPage';
import { getCurrentUser, logoutUser, verifyToken } from './services/apiService';

function App() {
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const verifiedUser = await verifyToken();
      if (verifiedUser) setUser(verifiedUser);
      else if (localStorage.getItem('token')) {
        // Token was invalid
        handleLogout();
      }
    };
    checkAuth();

    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogout = () => {
    logoutUser();
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes('contact')) return 'contact';
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('disclaimer')) return 'disclaimer';
    if (path.includes('admin')) return 'admin';
    if (path === '/') return 'home';
    if (path.includes('dashboard')) return 'dashboard';
    return '';
  };

  return (
    <>
      <Header
        activePage={getActivePage()}
        setActivePage={(page) => {
          if (page === 'home') navigate('/');
          else navigate('/' + page);
        }}
        user={user}
        onLogout={handleLogout}
      />

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
        </Routes>
      </main>

      <footer className="footer" style={{ marginTop: '50px', textAlign: 'center', padding: '20px 0', background: 'rgba(255,255,255,0.8)' }}>
        <p className="mb-0 text-muted">🌱 AI-Powered Plant Disease Detection</p>
        <p style={{ marginTop: '10px' }}>© 2026 Plant Disease Detector. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
