import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { lazy, Suspense } from 'react';
import MainLayout from './components/layout/MainLayout';

// Lazy loading all pages for Code Splitting (Performance Optimization)
const LandingPage = lazy(() => import('./pages/LandingPage'));
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

function App() {
  if (typeof window !== 'undefined' && window.location.search.includes('oauth=success')) {
    localStorage.setItem('isAuthenticated', 'true');
    // Clean up the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

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
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#050505]"><div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/verify-otp" element={<GuestRoute><VerifyOtpPage /></GuestRoute>} />
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
              <Route path=":id" element={<ProfilePage />} />
              <Route path=":id/connections" element={<ProfileConnectionsPage />} />
              <Route path=":id/posts" element={<UserPostsPage />} />
              <Route path="posts" element={<UserPostsPage />} />
            </Route>

            <Route
              path="/post"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path=":postId" element={<PostPage />} />
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

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<MessagesPage />} />
            </Route>

            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SearchPage />} />
            </Route>

            <Route
              path="/network"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<NetworkPage />} />
            </Route>

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SettingsPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
