import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { ArrowLeft, CreditCard, ShoppingBag, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePlaceOrder = async () => {
    if (!sessionId) {
      setError("Please scan the QR code to start a session.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const orderData = {
        session_id: sessionId,
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await api.post('/api/orders', orderData);
      clearCart();
      navigate(`/status/${response.data.order_id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">Empty Cravings</h2>
          <p className="text-slate-500 mb-8 max-w-sm font-medium">Add some of our chef's specialties to your cart to get started.</p>
          <Link to="/menu" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-lg shadow-slate-200 hover:bg-orange-500 transition-all active:scale-95 leading-none flex items-center space-x-3 pr-12">
            <span>Discover Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <Link to="/menu" className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <h1 className="text-3xl font-black text-slate-900 leading-none tracking-tight uppercase italic">Your Order</h1>
          </div>
          <button 
            onClick={clearCart}
            className="text-red-500 font-bold flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-black">Clear All</span>
          </button>
        </div>

        <div className="space-y-6 mb-12">
          <AnimatePresence>
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-red-100/20 border-2 border-red-100 rounded-3xl text-red-600 font-bold flex items-center space-x-3">
             <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shadow-lg">⚠️</div>
             <p>{error}</p>
          </motion.div>
        )}

        <div className="bg-slate-950 rounded-[40px] p-10 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">
              <span>Subtotal Cravings</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-8 border-t border-slate-800 pt-8">
              <div>
                 <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest block mb-1">Payable Total</span>
                 <span className="text-5xl font-black text-orange-500">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl flex items-center space-x-3">
                 <Sparkles className="w-6 h-6 text-orange-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Authentic<br/>Flavor Guaranteed</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 py-7 rounded-2xl font-black text-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center space-x-4 pr-12 group"
            >
              {loading ? (
                <span className="flex items-center space-x-3">
                  <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Pipeline...</span>
                </span>
              ) : (
                <>
                  <CreditCard className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span>Send to Kitchen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
