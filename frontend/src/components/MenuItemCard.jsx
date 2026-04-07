import React from 'react';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, Clock, Sparkles, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MenuItemCard = ({ item }) => {
  const { addToCart, cartItems } = useCart();
  const cartItem = cartItems.find(i => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] p-6 lg:p-8 shadow-sm border border-slate-50 hover:shadow-2xl hover:shadow-slate-200 transition-all group overflow-hidden relative">
      {/* Phase 8: Smart Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
         {item.total_orders > 10 && (
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-orange-200">
               <TrendingUp className="w-3 h-3" />
               <span>Popular</span>
            </div>
         )}
         {item.stock <= (item.low_stock_threshold || 5) && item.stock > 0 && (
            <div className="bg-red-50 text-red-500 border border-red-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
               <AlertTriangle className="w-3 h-3" />
               <span>Low Stock</span>
            </div>
         )}
      </div>

      <div className="relative mb-8 rounded-[32px] overflow-hidden aspect-[4/3] bg-slate-100">
        <img src={item.image_url || 'https://via.placeholder.com/400x300'} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-orange-500 transition-colors uppercase italic">{item.name}</h3>
          <span className="text-2xl font-black text-slate-950">${Number(item.price).toFixed(2)}</span>
        </div>
        
        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">{item.description}</p>
        
        <div className="flex items-center space-x-4 text-slate-400">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-black uppercase tracking-widest">{item.prep_time || 15} mins</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-black uppercase tracking-widest">{item.category}</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
            <div className="h-14 flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100 transition-all hover:bg-white hover:border-orange-500/20">
                <AnimatePresence mode="wait">
                    {quantity === 0 ? (
                        <motion.button 
                            key="add" onClick={() => addToCart(item)}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="h-full px-8 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 flex items-center space-x-2"
                        >
                            <span>Quick Add</span>
                            <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    ) : (
                        <motion.div key="qty" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center">
                            <button onClick={() => addToCart(item, -1)} className="p-3 text-slate-400 hover:text-red-500 transition-all active:scale-90"><Minus className="w-5 h-5" /></button>
                            <span className="w-10 text-center font-black text-slate-900">{quantity}</span>
                            <button onClick={() => addToCart(item, 1)} className="p-3 text-slate-400 hover:text-orange-500 transition-all active:scale-90"><Plus className="w-5 h-5" /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 bg-slate-50 px-3 py-1 rounded-lg">
                Available
            </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
