import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { CartProvider } from './context/CartContext';

// Customer Pages
import LandingPage from './pages/LandingPage';
import ScanHandler from './pages/ScanHandler';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderStatusPage from './pages/OrderStatusPage';
import FeedbackPage from './pages/FeedbackPage';

// Admin / SaaS Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import OrdersPage from './pages/OrdersPage';
import MenuManager from './pages/MenuManager';
import TableManager from './pages/TableManager';
import AnalyticsPage from './pages/AnalyticsPage';
import FeedbackCenter from './pages/FeedbackCenter';
import RegisterRestaurant from './pages/RegisterRestaurant';

// Super Admin Pages
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import DemoMenuPage from './pages/DemoMenuPage';

import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <SessionProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/scan" element={<ScanHandler />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/demo" element={<DemoMenuPage />} />
            <Route path="/status/:id" element={<OrderStatusPage />} />
            <Route path="/feedback/:orderId" element={<FeedbackPage />} />
            
            {/* SaaS Onboarding */}
            <Route path="/register" element={<RegisterRestaurant />} />
            
            {/* Admin / Staff Auth */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Admin Dashboard Protected Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="menu" element={<MenuManager />} />
              <Route path="tables" element={<TableManager />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="feedback" element={<FeedbackCenter />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/superadmin/login" element={<SuperAdminLogin />} />
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />

            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </CartProvider>
    </SessionProvider>
  );
}

export default App;
