// NotificationContext.jsx
import { createContext, useContext, useState, useCallback, useMemo } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);

  const openPane = useCallback((jsxContent) => {
    setContent(jsxContent);
    setIsOpen(true);
  }, []);

  const closePane = useCallback(() => {
    setIsOpen(false);
    setContent(null);
  }, []);

  const value = useMemo(
    () => ({ isOpen, content, openPane, closePane }),
    [isOpen, content, openPane, closePane]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
