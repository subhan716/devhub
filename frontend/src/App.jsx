import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { lazy, Suspense } from 'react';
import axios from 'axios';
import MainLayout from './components/layout/MainLayout';
import MaintenanceScreen from './components/common/MaintenanceScreen';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy loading all pages for Code Splitting (Performance Optimization)
import LandingPage from './pages/LandingPage';
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtpPage'));
const SetupProfilePage = lazy(() => import('./pages/SetupProfilePage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProfileConnectionsPage = lazy(() => import('./pages/ProfileConnectionsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const NetworkPage = lazy(() => import('./pages/NetworkPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const UserPostsPage = lazy(() => import('./pages/UserPostsPage'));
const PostPage = lazy(() => import('./pages/PostPage'));
const LegalCenterPage = lazy(() => import('./pages/LegalCenterPage'));
import { PageSkeleton } from './components/common/Skeletons';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Guest Route Component (Redirects to feed if logged in)
const GuestRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }
  return children;
};

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function App() {
  const [appConfig, setAppConfig] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const oauthSuccess = params.get('oauth') === 'success' || params.has('token');
      const tokenParam = params.get('token');
      const refreshParam = params.get('refreshToken');

      if (oauthSuccess) {
        if (tokenParam) {
          localStorage.setItem('accessToken', tokenParam);
          localStorage.setItem('token', tokenParam);
        }
        if (refreshParam) {
          localStorage.setItem('refreshToken', refreshParam);
        }
        localStorage.setItem('isAuthenticated', 'true');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const fetchAppConfig = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/public/app-config`);
      setAppConfig(data);
    } catch (e) {
      // Ignore if offline
    }
  };

  useEffect(() => {
    fetchAppConfig();
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Expose lenis globally so any component can stop/start it
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  // Full-Screen Platform Maintenance Lockout Guard
  if (appConfig?.maintenanceMode?.enabled) {
    return (
      <MaintenanceScreen
        title={appConfig.maintenanceMode.title}
        message={appConfig.maintenanceMode.message}
        estimatedEndTime={appConfig.maintenanceMode.estimatedEndTime}
      />
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-white dark:bg-[#0E0E12] text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 shadow-lg text-xs font-sans rounded-xl',
          duration: 3500
        }}
      />
      <Routes>
        {/* Public Landing Page */}
        <Route 
          path="/" 
          element={
            <GuestRoute>
              <LandingPage />
            </GuestRoute>
          } 
        />
        
        {/* Dedicated 50/50 Split-Screen Auth Pages */}
        <Route 
          path="/register" 
          element={
            <GuestRoute>
              <Suspense fallback={<PageSkeleton />}>
                <RegisterPage />
              </Suspense>
            </GuestRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <GuestRoute>
              <Suspense fallback={<PageSkeleton />}>
                <LoginPage />
              </Suspense>
            </GuestRoute>
          } 
        />
        <Route 
          path="/verify-otp" 
          element={
            <GuestRoute>
              <Suspense fallback={<PageSkeleton />}>
                <VerifyOtpPage />
              </Suspense>
            </GuestRoute>
          } 
        />

        {/* Dynamic Legal & Trust Center - In-App Public Access */}
        <Route
          path="/guidelines"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <LegalCenterPage />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <LegalCenterPage />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <LegalCenterPage />
            </Suspense>
          }
        />
        <Route
          path="/policies/:slug"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <LegalCenterPage />
            </Suspense>
          }
        />

        {/* Setup Profile Route (Post-Signup 4-Step Wizard) */}
        <Route 
          path="/setup-profile" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageSkeleton />}>
                <SetupProfilePage />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        {/* Authenticated Application Routes (Wrapped in Social Layout) */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/feed" element={<Suspense fallback={<PageSkeleton />}><FeedPage /></Suspense>} />
          <Route path="/notifications" element={<Suspense fallback={<PageSkeleton />}><NotificationsPage /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<PageSkeleton />}><ProfilePage /></Suspense>} />
          <Route path="/profile/:id" element={<Suspense fallback={<PageSkeleton />}><ProfilePage /></Suspense>} />
          <Route path="/profile/:id/connections" element={<Suspense fallback={<PageSkeleton />}><ProfileConnectionsPage /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<PageSkeleton />}><SettingsPage /></Suspense>} />
          <Route path="/jobs" element={<Suspense fallback={<PageSkeleton />}><JobsPage /></Suspense>} />
          <Route path="/search" element={<Suspense fallback={<PageSkeleton />}><SearchPage /></Suspense>} />
          <Route path="/network" element={<Suspense fallback={<PageSkeleton />}><NetworkPage /></Suspense>} />
          <Route path="/messages" element={<Suspense fallback={<PageSkeleton />}><MessagesPage /></Suspense>} />
          <Route path="/user-posts" element={<Suspense fallback={<PageSkeleton />}><UserPostsPage /></Suspense>} />
          <Route path="/posts/:id" element={<Suspense fallback={<PageSkeleton />}><PostPage /></Suspense>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
