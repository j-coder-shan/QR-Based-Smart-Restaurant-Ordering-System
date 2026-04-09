import React from 'react';
import { Minus, Plus, Trash2, Clock, MapPin, Tag, ChefHat, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { getImageUrl } from '../utils/urlUtils';

const CartItem = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <motion.div 
      layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[40px] p-8 lg:p-10 shadow-sm border border-slate-50 flex flex-col md:flex-row items-center gap-10 hover:shadow-2xl transition-all group"
    >
      <div className="relative w-full md:w-48 h-48 lg:w-56 lg:h-56 rounded-[32px] overflow-hidden bg-slate-100 shrink-0">
        <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm text-[10px] font-black uppercase tracking-widest text-orange-500">
           {item.category}
        </div>
      </div>

      <div className="flex-1 w-full space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase italic">{item.name}</h3>
            <div className="flex items-center space-x-3 text-slate-400">
               <div className="flex items-center space-x-1.5"><Clock className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase tracking-widest">{item.prep_time || 15} mins</span></div>
               <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
               <div className="flex items-center space-x-1.5"><ChefHat className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase tracking-widest">Premium Choice</span></div>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950">Rs. {(Number(item.price) * item.quantity).toFixed(2)}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-50">
           <div className="flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <button 
                onClick={() => addToCart(item, -1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-red-500 hover:shadow-sm transition-all active:scale-90"
              >
                {item.quantity === 1 ? <Trash2 className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
              </button>
              <span className="w-16 text-center text-xl font-black text-slate-900">{item.quantity}</span>
              <button 
                onClick={() => addToCart(item, 1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-orange-500 hover:shadow-sm transition-all active:scale-90"
              >
                <Plus className="w-5 h-5" />
              </button>
           </div>
           
           <div className="flex items-center space-x-3 bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100">
               <Sparkles className="w-4 h-4 text-orange-500" />
               <span className="text-xs font-black uppercase tracking-widest text-orange-600 leading-none">Smart Batching</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
