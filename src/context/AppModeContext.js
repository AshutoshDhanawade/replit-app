import React, { createContext, useState, useContext } from 'react';

const AppModeContext = createContext();

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
};

export const AppModeProvider = ({ children }) => {
  const [mode, setMode] = useState('marketplace');

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'marketplace' ? 'wardrobe' : 'marketplace');
  };

  const value = {
    mode,
    setMode,
    toggleMode,
    isMarketplaceMode: mode === 'marketplace',
    isWardrobeMode: mode === 'wardrobe'
  };

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
};
