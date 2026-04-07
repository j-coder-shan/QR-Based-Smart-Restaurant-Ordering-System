import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { CartProvider } from './context/CartContext';
import ScanHandler from './pages/ScanHandler';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderStatusPage from './pages/OrderStatusPage';
import KitchenDashboard from './pages/KitchenDashboard';
import ErrorPage from './pages/ErrorPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <SessionProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/scan" element={<ScanHandler />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/status/:id" element={<OrderStatusPage />} />
            <Route path="/admin" element={<KitchenDashboard />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </CartProvider>
    </SessionProvider>
  );
}

export default App;
