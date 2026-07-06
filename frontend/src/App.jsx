import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import SetupProfilePage from './pages/SetupProfilePage';
import FeedPage from './pages/FeedPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
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
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1a', color: '#fff' } }} />
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

          {/* Default Catch-all redirect to feed if logged in, else landing */}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
