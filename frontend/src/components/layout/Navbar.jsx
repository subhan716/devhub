import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed w-full z-40 top-0 border-b border-white/10 bg-[#08080A]/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-8 h-8 object-contain rounded-xl drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
            <span className="text-xl font-extrabold tracking-tight text-white">
              Dev<span className="text-[#00F0FF]">Hub</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>

          {/* Direct Link to Dedicated Split-Screen Pages */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-zinc-300 hover:text-white font-semibold text-xs sm:text-sm transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-zinc-100 text-zinc-950 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:scale-102"
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
