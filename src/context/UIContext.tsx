import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync dark mode class with body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
