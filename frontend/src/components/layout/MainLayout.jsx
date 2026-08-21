import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import TopNavbar from './TopNavbar';
import BottomNavbar from './BottomNavbar';
import FloatingChat from '../chat/FloatingChat';
import GlobalAlertBanner from '../common/GlobalAlertBanner';
import { SocketProvider } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
        setCurrentUser(data);
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <SocketProvider currentUser={currentUser}>
      <div className={`${isDark ? 'bg-[#050505] text-white selection:bg-[#00F0FF]/30' : 'bg-slate-50 text-slate-900 selection:bg-[#0A66C2]/20'} ${isMessagesPage ? 'h-[100dvh] overflow-hidden fixed inset-0 w-full' : 'min-h-[100dvh]'} transition-colors duration-200 font-sans`}>
        {/* 3-Column Layout structure */}
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        {!isMessagesPage && <RightSidebar currentUser={currentUser} />}
        
        {/* Main Content Area */}
        <main className={`lg:ml-64 ${!isMessagesPage ? 'xl:mr-80 min-h-[100dvh]' : 'h-[100dvh] overflow-hidden'} flex flex-col relative transition-all duration-300 pb-[70px] lg:pb-0`}>
          {/* Top Real-Time Alert & Emergency Banner */}
          <GlobalAlertBanner />

          <TopNavbar setIsMobileMenuOpen={setIsMobileMenuOpen} currentUser={currentUser} isMessagesPage={isMessagesPage} />
          <div className={`flex-1 w-full min-h-0 ${!isMessagesPage ? 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : 'max-w-full p-0 flex flex-col'}`}>
            <Outlet context={{ currentUser }} />
          </div>
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <BottomNavbar currentUser={currentUser} />

        {/* Persistent Floating Chat Component */}
        <FloatingChat currentUser={currentUser} />
      </div>
    </SocketProvider>
  );
};

export default MainLayout;
