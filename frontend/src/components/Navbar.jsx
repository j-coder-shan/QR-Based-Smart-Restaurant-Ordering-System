import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import api from '../services/api';
import { ShoppingCart, UtensilsCrossed, Check, RotateCcw, LogOut, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { cartItems } = useCart();
    const { sessionId, tableNumber, endSession } = useSession();
    const [callStatus, setCallStatus] = useState('idle');
    const navigate = useNavigate();
    const isAdmin = window.location.pathname.startsWith('/admin');

    const handleCallWaiter = async () => {
        if (!sessionId) return;
        setCallStatus('calling');
        try {
            await api.post('/api/waiter-call', { session_id: sessionId });
            setCallStatus('success');
            setTimeout(() => setCallStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setCallStatus('idle');
        }
    };

    return (
        <nav className={`sticky top-0 z-50 px-4 py-4 border-b ${isAdmin ? 'bg-slate-950 border-slate-800' : 'bg-white/80 backdrop-blur-xl border-slate-100'}`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:rotate-12 transition-transform">
                        <UtensilsCrossed className="text-white w-6 h-6" />
                    </div>
                    <span className={`text-2xl font-black tracking-tighter ${isAdmin ? 'text-white' : 'text-slate-900'}`}>SmartDine</span>
                </Link>

                <div className="flex items-center space-x-2 md:space-x-6">
                    {!isAdmin && tableNumber && (
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Your Table</span>
                            <span className="text-sm font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">#{tableNumber}</span>
                        </div>
                    )}

                    {!isAdmin && sessionId && (
                        <button 
                            onClick={handleCallWaiter}
                            disabled={callStatus !== 'idle'}
                            className={`p-3 rounded-2xl transition-all active:scale-90 relative ${
                                callStatus === 'success' ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {callStatus === 'calling' ? (
                                <RotateCcw className="w-5 h-5 animate-spin" />
                            ) : callStatus === 'success' ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <BellRing className="w-5 h-5" />
                            )}
                        </button>
                    )}

                    {!isAdmin && (
                        <Link to="/cart" className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-orange-500 transition-all active:scale-90 relative shadow-lg shadow-slate-200">
                            <ShoppingCart className="w-5 h-5" />
                            <AnimatePresence>
                                {cartItems.length > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-white"
                                    >
                                        {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    )}

                    {isAdmin && (
                        <div className="flex items-center space-x-3">
                             <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Status</span>
                                <span className="text-sm font-black text-green-500 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Live
                                </span>
                            </div>
                            <button onClick={() => { endSession(); navigate('/'); }} className="p-3 bg-slate-900 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-slate-800">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
