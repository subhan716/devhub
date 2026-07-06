import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import SetupProfilePage from './pages/SetupProfilePage';
import FeedPage from './pages/FeedPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import JobsPage from './pages/JobsPage';
import MainLayout from './components/layout/MainLayout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Check for OAuth success in URL across the entire app on load
  if (typeof window !== 'undefined' && window.location.search.includes('oauth=success')) {
    localStorage.setItem('isAuthenticated', 'true');
    // Clean up the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  return (
    <>
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            background: '#0a0a0a', 
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 20px'
          },
          success: {
            iconTheme: {
              primary: '#00F0FF',
              secondary: '#0a0a0a',
            },
            style: {
              border: '1px solid rgba(0, 240, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
            }
          },
          error: {
            iconTheme: {
              primary: '#ff0055',
              secondary: '#0a0a0a',
            },
            style: {
              border: '1px solid rgba(255, 0, 85, 0.3)',
              boxShadow: '0 0 20px rgba(255, 0, 85, 0.2)',
            }
          }
        }} 
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/setup-profile" element={<SetupProfilePage />} />

          {/* Protected Routes inside MainLayout */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FeedPage />} />
          </Route>
          
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NotificationsPage />} />
          </Route>

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfilePage />} />
          </Route>

          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<JobsPage />} />
          </Route>

          {/* Default Catch-all redirect to feed if logged in, else landing */}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
