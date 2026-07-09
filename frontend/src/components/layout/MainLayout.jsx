import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import TopNavbar from './TopNavbar';
import { SocketProvider } from '../../context/SocketContext';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
      <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00F0FF]/30">
        {/* 3-Column Layout structure matching the mockup */}
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <RightSidebar />
        
        {/* Main Content Area */}
        <main className="md:ml-64 lg:mr-80 flex flex-col min-h-screen relative">
          <TopNavbar setIsMobileMenuOpen={setIsMobileMenuOpen} currentUser={currentUser} />
          <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet context={{ currentUser }} />
          </div>
        </main>
      </div>
    </SocketProvider>
  );
};

export default MainLayout;
