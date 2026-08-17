import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { getAdminMe, logoutAdmin } from './api/adminApi';

const App = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await getAdminMe();
      if (['admin', 'super_admin', 'moderator'].includes(data.role)) {
        setAdminUser(data);
      } else {
        setAdminUser(null);
      }
    } catch (err) {
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      // Ignore
    }
    setAdminUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00F0FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141414',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '12px',
          },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            adminUser ? (
              <Navigate to="/" replace />
            ) : (
              <AdminLoginPage onLoginSuccess={(user) => setAdminUser(user)} />
            )
          }
        />
        <Route
          path="/*"
          element={
            adminUser ? (
              <AdminDashboardPage adminUser={adminUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
