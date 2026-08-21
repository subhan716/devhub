import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Initial State from localStorage (Defaults to 'dark' for developer aesthetic)
  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('devhub_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      return 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const isDark = theme === 'dark';

  // 2. Apply theme class to <html> and broadcast changes
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
      localStorage.setItem('devhub_theme', theme);
    } catch (e) {
      console.warn('Failed to persist theme to localStorage:', e);
    }
  }, [theme]);

  // 3. Multi-Tab Real-Time Synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'devhub_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
