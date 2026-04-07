import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(localStorage.getItem('session_id') || null);
  const [tableNumber, setTableNumber] = useState(localStorage.getItem('table_number') || null);

  const startSession = (id, table) => {
    setSessionId(id);
    setTableNumber(table);
    localStorage.setItem('session_id', id);
    localStorage.setItem('table_number', table);
  };

  const endSession = () => {
    setSessionId(null);
    setTableNumber(null);
    localStorage.removeItem('session_id');
    localStorage.removeItem('table_number');
  };

  return (
    <SessionContext.Provider value={{ sessionId, tableNumber, startSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
