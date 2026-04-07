import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Utensils, QrCode, Smartphone, Sparkles, ChefHat, ArrowRight, Shield } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-600">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <Utensils size={24} />
                        </div>
                        <span className="font-black text-2xl tracking-tighter uppercase italic">Smart<span className="text-orange-500">Dine</span></span>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={() => navigate('/register')}
                            className="hidden md:flex items-center space-x-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors"
                        >
                            <span>Own a Restaurant?</span>
                            <span className="text-slate-900">Register Now</span>
                            <ArrowRight size={14} />
                        </button>
                        <button 
                            onClick={() => navigate('/superadmin/login')}
                            className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                            title="System Administration"
                        >
                            <Shield size={20} />
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 pt-32 lg:pt-48 pb-40">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="bg-orange-50 text-orange-600 px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-widest inline-flex items-center space-x-2 mb-8 border border-orange-100 shadow-sm shadow-orange-50">
                            <Sparkles className="w-4 h-4" />
                            <span>SaaS Ready Restaurant Ecosystem</span>
                        </div>
                        
                        <h1 className="text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-10 italic uppercase">
                            Smart <span className="text-orange-500">Dine</span> System.
                        </h1>
                        
                        <p className="text-xl text-slate-500 font-medium mb-12 max-w-lg leading-relaxed">
                            A fully automated QR-based ordering ecosystem now available for every restaurant. From trial to scale.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => navigate('/scan?table=T01&token=TOKEN_T01_XYZ')}
                                className="bg-slate-900 text-white px-10 py-6 rounded-3xl font-black text-xl hover:bg-orange-500 hover:shadow-2xl hover:shadow-orange-200 transition-all active:scale-95 flex items-center justify-center space-x-4 pr-12 group"
                            >
                                <Smartphone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                <span>Demo Order</span>
                            </button>
                            
                            <button 
                                onClick={() => navigate('/admin/login')}
                                className="bg-white border-2 border-slate-100 text-slate-500 px-10 py-6 rounded-3xl font-black text-xl hover:bg-slate-50 transition-all flex items-center justify-center space-x-4 pr-12"
                            >
                                <ChefHat className="w-6 h-6 text-slate-400" />
                                <span>Staff Portal</span>
                            </button>
                        </div>

                        <div className="mt-16 flex items-center space-x-8 text-slate-300">
                           <div className="flex flex-col">
                              <span className="text-4xl font-black text-slate-900 leading-none">100+</span>
                              <span className="text-[10px] font-black uppercase tracking-widest mt-1">Categories</span>
                           </div>
                           <div className="w-px h-10 bg-slate-100" />
                           <div className="flex flex-col">
                              <span className="text-4xl font-black text-slate-900 leading-none">FREE</span>
                              <span className="text-[10px] font-black uppercase tracking-widest mt-1">7-Day Trial</span>
                           </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }} 
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-radial from-orange-100 to-transparent blur-3xl opacity-50 -z-10" />
                        <div className="bg-slate-900 rounded-[80px] p-12 lg:p-24 shadow-[0_80px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden group border-8 border-white">
                           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 to-transparent"></div>
                           <div className="relative z-10 flex flex-col items-center text-center">
                               <div className="w-56 h-56 bg-white rounded-[56px] flex items-center justify-center mb-10 shadow-2xl relative transition-transform group-hover:scale-105 duration-500">
                                   <QrCode className="w-28 h-28 text-slate-900" />
                                   <div className="absolute -top-4 -right-4 w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black animate-bounce">
                                      <ArrowRight className="w-6 h-6" />
                                   </div>
                               </div>
                               <h3 className="text-4xl font-black text-white mb-4 leading-none uppercase italic">Scale Your Business</h3>
                               <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm leading-relaxed tracking-wide">
                                   Register today and get 7 days of full access to our intelligent ordering system for free.
                               </p>
                           </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
