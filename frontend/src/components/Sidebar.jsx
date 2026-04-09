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
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { restaurantName } = useSession();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const displayRestaurantName = restaurantName || localStorage.getItem('restaurant_name') || 'Admin Portal';

  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard', roles: ['ADMIN'] },
    { icon: ClipboardList, label: 'Orders', path: '/admin/orders', roles: ['ADMIN', 'STAFF'] },
    { icon: Utensils, label: 'Menu Items', path: '/admin/menu', roles: ['ADMIN'] },
    { icon: Grid2X2, label: 'Tables', path: '/admin/tables', roles: ['ADMIN'] },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', roles: ['ADMIN'] },
    { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback', roles: ['ADMIN'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.clear(); // Clear everything
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                <Utensils className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black text-white italic uppercase tracking-tighter truncate">
                {displayRestaurantName}
              </span>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
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
    </>
  );
};

export default Sidebar;
