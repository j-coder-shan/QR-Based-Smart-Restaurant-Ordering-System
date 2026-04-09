import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(localStorage.getItem('session_id') || null);
  const [tableNumber, setTableNumber] = useState(localStorage.getItem('table_number') || null);
  const [restaurantName, setRestaurantName] = useState(localStorage.getItem('restaurant_name') || null);

  const startSession = (id, table, name) => {
    setSessionId(id);
    setTableNumber(table);
    setRestaurantName(name);
    localStorage.setItem('session_id', id);
    localStorage.setItem('table_number', table);
    if (name) localStorage.setItem('restaurant_name', name);
  };

  const endSession = () => {
    setSessionId(null);
    setTableNumber(null);
    setRestaurantName(null);
    localStorage.removeItem('session_id');
    localStorage.removeItem('table_number');
    localStorage.removeItem('restaurant_name');
  };

  return (
    <SessionContext.Provider value={{ sessionId, tableNumber, restaurantName, startSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
