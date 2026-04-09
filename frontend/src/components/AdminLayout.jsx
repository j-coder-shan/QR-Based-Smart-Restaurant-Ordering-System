import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSession } from '../context/SessionContext';

const AdminLayout = () => {
  const { restaurantName } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = window.location.pathname;
  const displayRestaurantName = restaurantName || localStorage.getItem('restaurant_name') || 'Admin Portal';

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect Staff away from Admin only pages
  if (role === 'STAFF' && (location === '/admin' || location === '/admin/dashboard')) {
    return <Navigate to="/admin/orders" replace />;
  }

  // Handle root /admin redirect for Admin
  if (role === 'ADMIN' && location === '/admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto max-h-screen custom-scrollbar transition-all duration-300">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 sticky top-0 bg-slate-900/80 backdrop-blur-xl z-30 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="font-black text-xs italic">A</span>
             </div>
             <span className="text-xl font-black text-white italic uppercase tracking-tighter truncate">
                {displayRestaurantName}
             </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-slate-800 rounded-lg text-slate-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
