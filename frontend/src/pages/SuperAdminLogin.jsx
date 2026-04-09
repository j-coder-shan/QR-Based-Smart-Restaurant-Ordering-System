import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiActivity, FiShield } from 'react-icons/fi';

const SuperAdminLogin = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${apiBase}/superadmin/login`, formData);
            
            localStorage.setItem('superAdminToken', res.data.token);
            localStorage.setItem('superAdminUser', JSON.stringify(res.data));
            
            navigate('/superadmin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Invalid super admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 text-orange-500 rounded-2xl mb-4 border border-orange-500/30">
                        <FiShield size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">System Admin <span className="text-orange-500">Access</span></h1>
                    <p className="text-slate-400 mt-2 italic">Unauthorized access is strictly prohibited</p>
                </div>

                <form onSubmit={handleLogin} className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    
                    <div className="space-y-6">
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                name="username" 
                                type="text" 
                                placeholder="Admin Identifier" 
                                className="w-full pl-10 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-orange-500 outline-none transition-all"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                name="password" 
                                type="password" 
                                placeholder="Access Key" 
                                className="w-full pl-10 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-orange-500 outline-none transition-all"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && (
                            <motion.p 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="text-orange-400 text-sm font-medium bg-orange-500/10 p-3 rounded-lg border border-orange-500/20"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-500 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Authenticating...' : 'Initiate Secure Login'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8 space-y-4">
                    <p className="text-slate-500 text-xs tracking-widest uppercase">Encryption Level: AES-256</p>
                    <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white text-sm transition-colors border-b border-slate-700 pb-1">
                        Return to Public Terminal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
