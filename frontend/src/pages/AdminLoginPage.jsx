import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ChefHat, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/admin/login', { username, password });
            localStorage.setItem('adminToken', res.data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-orange-500/30">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-md"
            >
                <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-[60px] shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10" />

                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-orange-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-500/20 group hover:rotate-12 transition-transform duration-500">
                            <ChefHat className="text-white w-10 h-10" />
                        </div>
                        <div className="bg-orange-500/10 text-orange-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center space-x-2 mb-6 border border-orange-500/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Authorized Access Only</span>
                        </div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">SmartDine</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Management Terminal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="USERNAME"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-6 pl-16 rounded-3xl outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-bold tracking-widest uppercase text-xs"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
                                <input
                                    type="password"
                                    placeholder="PASSWORD"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-6 pl-16 rounded-3xl outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-bold tracking-widest uppercase text-xs"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button 
                            disabled={loading}
                            className="w-full bg-orange-500 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-xl shadow-orange-500/20 flex items-center justify-center space-x-3 group"
                        >
                            <span>{loading ? 'Authenticating...' : 'Authorize Terminal'}</span>
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>
                <p className="mt-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    Intelligent Restaurant Ordering System © 2026
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLoginPage;
