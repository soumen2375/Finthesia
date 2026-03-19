import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UIContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('privacyMode') || 'false'); } catch { return false; }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('darkMode') || 'false'); } catch { return false; }
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();

  // Sync dark mode class with document and persist
  // Only apply dark mode on authenticated dashboard routes
  useEffect(() => {
    const isPublicPage = [
      '/', '/login', '/register', '/forgot-password', '/about', 
      '/features', '/pricing', '/contact', '/faq', '/blog',
      '/terms', '/privacy-policy', '/shipping', '/refunds'
    ].includes(location.pathname);

    if (isDarkMode && !isPublicPage) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode, location.pathname]);

  // Persist privacy mode
  useEffect(() => {
    localStorage.setItem('privacyMode', JSON.stringify(isPrivacyMode));
  }, [isPrivacyMode]);

  const togglePrivacyMode = () => setIsPrivacyMode((prev) => !prev);
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <UIContext.Provider value={{ isPrivacyMode, togglePrivacyMode, isDarkMode, toggleDarkMode, refreshKey, triggerRefresh }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
