import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  Grid2X2, 
  ClipboardList, 
  BarChart3, 
  MessageSquare, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: ClipboardList, label: 'Orders', path: '/admin/orders' },
    { icon: Utensils, label: 'Menu Items', path: '/admin/menu' },
    { icon: Grid2X2, label: 'Tables', path: '/admin/tables' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Utensils className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-white italic uppercase tracking-tighter">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/10' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-4 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-sm uppercase tracking-widest"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
