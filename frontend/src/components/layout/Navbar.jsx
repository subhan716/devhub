import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="fixed w-full z-50 top-0 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-10 h-10 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dev<span className="text-[#0A66C2] dark:text-[#00F0FF]">Hub</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-gray-300">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</a>
          </div>

          {/* Auth Buttons & Theme Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* 1-Click Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDark ? "Switch to Light Studio" : "Switch to Dark Obsidian"}
              className="p-2 rounded-xl text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center justify-center group shadow-xs"
            >
              {isDark ? (
                <Sun size={18} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon size={18} className="text-slate-700 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            <Link to="/login" className="text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors px-2 py-1.5">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-[#0A66C2] hover:bg-[#004182] text-white dark:bg-white/10 dark:hover:bg-white/20 dark:border dark:border-white/10 dark:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
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
