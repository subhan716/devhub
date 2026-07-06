import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-10 h-10 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Dev<span className="text-[#00F0FF]">Hub</span>
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#community" className="hover:text-white transition-colors">Community</a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              Join the Hub
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
