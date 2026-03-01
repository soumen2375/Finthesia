import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const togglePrivacyMode = () => setIsPrivacyMode((prev) => !prev);
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <UIContext.Provider value={{ isPrivacyMode, togglePrivacyMode, refreshKey, triggerRefresh }}>
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
