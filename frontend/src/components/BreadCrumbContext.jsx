// BreadcrumbContext.jsx
import { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
  const location = useLocation();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Add new page to history when location changes
    setHistory((prev) => {
      const exists = prev.find((item) => item.pathname === location.pathname);
      if (exists) return prev; // Avoid duplicates

      return [
        ...prev,
        {
          pathname: location.pathname,
          label:
            location.pathname.split('/').filter(Boolean).join(' > ') || 'Home',
        },
      ].slice(-5); // keep only last 5 pages
    });
  }, [location]);

  return (
    <BreadcrumbContext.Provider value={history}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBreadcrumbs = () => useContext(BreadcrumbContext);
