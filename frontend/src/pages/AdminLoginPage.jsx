import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiLayout, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { ChefHat } from 'lucide-react';
import { useSession } from '../context/SessionContext';

const AdminLoginPage = () => {
    const { startSession } = useSession();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token) {
            if (role === 'STAFF') {
                navigate('/admin/orders');
            } else {
                navigate('/admin/dashboard');
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${apiBase}/admin/login`, { username, password });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('restaurantId', res.data.restaurantId);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            // Also update SessionContext
            startSession(null, null, res.data.restaurantName);

            if (res.data.role === 'STAFF') {
                navigate('/admin/orders'); // Staff goes to kitchen
            } else {
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-white">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-orange-200/50 mb-4 border-2 border-orange-100">
                        <ChefHat className="text-orange-500 w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
                        Smart <span className="text-orange-500">Staff</span> Portal
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Authenticated Access Only</p>
                </div>

                <form onSubmit={handleLogin} className="bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 border-2 border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Username / ID</label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    type="text"
                                    placeholder="Enter username"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Access PIN / Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100"
                            >
                                <FiAlertCircle className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-orange-500 hover:shadow-2xl hover:shadow-orange-200 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none flex items-center justify-center gap-3 group"
                        >
                            {loading ? 'Verifying...' : 'Access Portal'}
                            {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8">
                    <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-900 font-bold text-sm tracking-wide transition-colors">
                        Return to Public Terminal
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">System Secure</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLoginPage;
