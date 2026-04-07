import React from 'react';
import { X, Clock, MapPin, Receipt, CheckCircle2, Package, UserCheck, Flame, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from './StatusBadge';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[60px] w-full max-w-2xl overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all active:scale-90 z-20">
          <X className="w-6 h-6 text-slate-400" />
        </button>

        <div className="p-12 lg:p-16 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <header className="mb-12">
            <div className="flex items-center space-x-4 mb-4">
              <StatusBadge status={order.status} />
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">ID: #{order.id}</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">Table #{order.table.table_number}</h2>
            <div className="flex items-center space-x-2 text-slate-400 font-bold">
               <Clock className="w-4 h-4" />
               <span>Ordered {new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
          </header>

          <div className="space-y-8 mb-12">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Order Items</h3>
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start group">
                <div className="flex gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl overflow-hidden relative border border-slate-100">
                     <img src={item.menuItem.image_url || 'https://via.placeholder.com/100'} alt={item.menuItem.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-1 group-hover:text-orange-500 transition-colors italic uppercase italic">{item.menuItem.name}</h4>
                    <p className="text-slate-400 text-sm font-bold">{item.quantity} units × Rs.{item.unit_price}</p>
                  </div>
                </div>
                <span className="text-xl font-black text-slate-900">Rs.{item.subtotal}</span>
              </div>
            ))}
          </div>

          <footer className="bg-slate-950 rounded-[40px] p-10 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
             <div className="relative z-10 flex justify-between items-end">
                <div>
                   <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest block mb-1">Total Bill</span>
                   <span className="text-5xl font-black text-orange-500">Rs.{order.total_amount}</span>
                </div>
                <div className={`px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest ${order.is_paid ? 'bg-green-500' : 'bg-orange-500'}`}>
                   {order.is_paid ? 'Paid' : 'Unpaid'}
                </div>
             </div>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailsModal;
