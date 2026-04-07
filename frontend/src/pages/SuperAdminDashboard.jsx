import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiCreditCard, FiKey, FiLock, FiUnlock, FiPlus, FiLogOut, FiActivity, FiSearch, FiRefreshCw, FiGrid, FiClock, FiShield, FiLayout } from 'react-icons/fi';

const SuperAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [restaurants, setRestaurants] = useState([]);
    const [keys, setKeys] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('superAdminToken');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [resAn, resRe, resKe] = await Promise.all([
                axios.get(`${apiBase}/superadmin/analytics`, config),
                axios.get(`${apiBase}/superadmin/restaurants`, config),
                axios.get(`${apiBase}/superadmin/keys`, config)
            ]);
            setAnalytics(resAn.data);
            setRestaurants(resRe.data);
            setKeys(resKe.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) window.location.href = '/superadmin/login';
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) window.location.href = '/superadmin/login';
        fetchAll();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${apiBase}/superadmin/restaurants/${id}/status`, { status: newStatus }, config);
            fetchAll();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const generateKey = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${apiBase}/superadmin/keys`, { count: 1 }, config);
            fetchAll();
        } catch (err) {
            alert('Failed to generate key');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminUser');
        window.location.href = '/superadmin/login';
    };

    if (loading && !analytics) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <FiRefreshCw className="text-red-500 text-4xl" />
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                        <FiShield size={24} className="text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Super <span className="text-red-500">Admin</span></span>
                </div>

                <nav className="space-y-2 flex-1">
                    {[
                        { id: 'overview', icon: FiActivity, label: 'Overview' },
                        { id: 'restaurants', icon: FiUsers, label: 'Restaurants' },
                        { id: 'keys', icon: FiKey, label: 'License Keys' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                activeTab === item.id 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <item.icon />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors mt-auto"
                >
                    <FiLogOut />
                    <span className="font-medium">Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold capitalize">{activeTab} Interface</h1>
                        <p className="text-slate-500">SaaS Platform Control Center v1.0</p>
                    </div>
                    <button onClick={fetchAll} className="p-3 bg-slate-900 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all">
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <StatCard label="Total Tenants" value={analytics?.total_restaurants} icon={FiUsers} color="blue" />
                                <StatCard label="Active Subs" value={analytics?.active} icon={FiCreditCard} color="green" />
                                <StatCard label="In Trial" value={analytics?.trial} icon={FiLayout} color="purple" />
                                <StatCard label="Total Revenue" value={`Rs.${analytics?.total_revenue}`} icon={FiActivity} color="red" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
                                    <h3 className="font-bold mb-6 flex items-center gap-2">
                                        <FiActivity className="text-red-500" /> Recent Activity
                                    </h3>
                                    <div className="space-y-4">
                                        {restaurants.slice(0, 5).map(r => (
                                            <div key={r.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs uppercase">{r.name[0]}</div>
                                                    <div>
                                                        <p className="text-sm font-bold">{r.name}</p>
                                                        <p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${r.subscription.status === 'TRIAL' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                                    {r.subscription.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-center space-y-4">
                                    <FiActivity size={40} className="text-slate-700" />
                                    <p className="text-slate-500 text-center">Charts and detailed growth analytics will appear here as more restaurants join.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'restaurants' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="relative max-w-md">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-red-500"
                                    placeholder="Search restaurants..."
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest font-bold">
                                            <th className="px-6 py-4">Restaurant</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Subscription</th>
                                            <th className="px-6 py-4">Expiry</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {restaurants.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map(r => (
                                            <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold">{r.name}</p>
                                                        <p className="text-xs text-slate-500">{r.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${r.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs">{r.subscription.status}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <FiClock /> {new Date(r.subscription.status === 'TRIAL' ? r.subscription.trial_end_date : r.subscription.end_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => toggleStatus(r.id, r.status)}
                                                        className={`p-2 rounded-lg border transition-all ${r.status === 'ACTIVE' ? 'border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white' : 'border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white'}`}
                                                    >
                                                        {r.status === 'ACTIVE' ? <FiLock /> : <FiUnlock />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'keys' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Available License Keys</h2>
                                <button 
                                    onClick={generateKey}
                                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 flex items-center gap-2 hover:bg-red-500"
                                >
                                    <FiPlus /> Generate New Key
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {keys.map(k => (
                                    <div key={k.id} className={`p-6 rounded-2xl border ${k.is_used ? 'bg-slate-900 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700 ring-1 ring-red-500/30'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <FiKey className={k.is_used ? 'text-slate-600' : 'text-red-500'} size={24} />
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${k.is_used ? 'bg-slate-700 text-slate-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {k.is_used ? 'USED' : 'AVAILABLE'}
                                            </span>
                                        </div>
                                        <p className="font-mono text-xl font-bold tracking-widest">{k.key_code}</p>
                                        <p className="text-xs text-slate-500 mt-2">Created: {new Date(k.createdAt).toLocaleDateString()}</p>
                                        {k.restaurant_name && <p className="text-xs text-red-400 mt-1 font-bold">Store: {k.restaurant_name}</p>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-colors group">
        <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
    </div>
);

export default SuperAdminDashboard;
