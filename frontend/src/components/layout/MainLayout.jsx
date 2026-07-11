import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import TopNavbar from './TopNavbar';
import FloatingChat from '../chat/FloatingChat';
import { SocketProvider } from '../../context/SocketContext';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/auth/me');
        setCurrentUser(data);
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <SocketProvider currentUser={currentUser}>
      <div className={`min-h-screen bg-[#050505] text-white selection:bg-[#00F0FF]/30 ${isMessagesPage ? 'h-screen overflow-hidden' : ''}`}>
        {/* 3-Column Layout structure matching the mockup */}
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        {!isMessagesPage && <RightSidebar />}
        
        {/* Main Content Area */}
        <main className={`md:ml-64 ${!isMessagesPage ? 'lg:mr-80 min-h-screen' : 'h-screen overflow-hidden'} flex flex-col relative transition-all duration-300`}>
          <TopNavbar setIsMobileMenuOpen={setIsMobileMenuOpen} currentUser={currentUser} isMessagesPage={isMessagesPage} />
          <div className={`flex-1 w-full min-h-0 ${!isMessagesPage ? 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : 'max-w-full p-0 flex flex-col'}`}>
            <Outlet context={{ currentUser }} />
          </div>
        </main>
        
        {/* Persistent Floating Chat Component */}
        <FloatingChat currentUser={currentUser} />
      </div>
    </SocketProvider>
  );
};

export default MainLayout;
