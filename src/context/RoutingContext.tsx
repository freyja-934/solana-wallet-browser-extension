import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define the available pages/tabs
export enum Page {
  ONBOARDING = 'onboarding',
  DASHBOARD = 'dashboard',
}

// Define the context type
interface RoutingContextType {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

// Create the context with a default value
const RoutingContext = createContext<RoutingContextType | undefined>(undefined);

// Create a provider component
interface RoutingProviderProps {
  children: ReactNode;
  initialPage?: Page;
}

export const RoutingProvider: React.FC<RoutingProviderProps> = ({ 
  children, 
  initialPage = Page.ONBOARDING 
}) => {
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);

  // Load the last page from Chrome storage on mount
  useEffect(() => {
    // Check if we're in a Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage(
        { type: 'GET_LAST_PAGE' },
        (response) => {
          if (response && response.page) {
            setCurrentPage(response.page as Page);
          }
        }
      );
    }
  }, []);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    
    // Save the current page to Chrome storage
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage(
        { type: 'SAVE_LAST_PAGE', page },
        () => {}
      );
    }
  };

  return (
    <RoutingContext.Provider value={{ currentPage, navigateTo }}>
      {children}
    </RoutingContext.Provider>
  );
};

// Create a custom hook to use the routing context
export const useRouting = (): RoutingContextType => {
  const context = useContext(RoutingContext);
  if (context === undefined) {
    throw new Error('useRouting must be used within a RoutingProvider');
  }
  return context;
}; 