import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import TopNavbar from './TopNavbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00F0FF]/30">
      {/* 3-Column Layout structure matching the mockup */}
      <Sidebar />
      <RightSidebar />
      
      {/* Main Content Area */}
      <main className="md:ml-64 lg:mr-80 flex flex-col min-h-screen relative">
        <TopNavbar />
        <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
