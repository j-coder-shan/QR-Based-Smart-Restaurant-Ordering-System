import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import OrderCard from '../components/OrderCard';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { ChefHat, CheckCircle2, Clock, Package, RotateCcw, XCircle, BellRing, Receipt, DollarSign, CreditCard, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const KitchenDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [waiterCalls, setWaiterCalls] = useState([]);
    const [billRequests, setBillRequests] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'pending', 'active', 'completed'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedBill, setSelectedBill] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
    const lastOrderCount = useRef(0);

    const fetchData = async () => {
        try {
            const [ordersRes, callsRes, menuRes, billsRes] = await Promise.all([
                api.get('/api/orders'),
                api.get('/api/waiter-call'),
                api.get('/api/menu'),
                api.get('/api/payments/requests')
            ]);
            setOrders(ordersRes.data);
            setWaiterCalls(callsRes.data);
            setMenuItems(menuRes.data);
            setBillRequests(billsRes.data);

            const pendingCount = ordersRes.data.filter(o => o.status === 'Pending').length;
            if (pendingCount > lastOrderCount.current) {
                audioRef.current.play().catch(() => {});
            }
            lastOrderCount.current = pendingCount;
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            alert(err.response?.data?.error || "Update failed.");
        }
    };

    const resolveCall = async (callId) => {
        try {
            await api.put(`/api/waiter-call/${callId}/resolve`);
            setWaiterCalls(prev => prev.filter(c => c.id !== callId));
        } catch (err) { console.error(err); }
    };

    const processPayment = async (sessionId, method) => {
        try {
            await api.post('/api/payments/process', { session_id: sessionId, payment_method: method });
            setBillRequests(prev => prev.filter(b => b.session_id !== sessionId));
            setSelectedBill(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || "Payment failed.");
        }
    };

    const filteredOrders = orders.filter(o => {
        if (activeTab === 'pending') return o.status === 'Pending';
        if (activeTab === 'active') return ['Accepted', 'Preparing', 'Ready', 'Delivered'].includes(o.status);
        if (activeTab === 'completed') return o.status === 'Completed';
        return false;
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 p-12 rounded-[60px] shadow-2xl w-full max-w-md border border-slate-800 text-center">
                    <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl shadow-orange-500/20">
                        <ChefHat className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-8 italic uppercase tracking-tighter">Kitchen Access</h1>
                    <form onSubmit={(e) => { e.preventDefault(); if (password === 'admin123') setIsAuthenticated(true); else setError('Invalid PIN'); }} className="space-y-6">
                        <input type="password" placeholder="ENTER STAFF PIN" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white p-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-black text-center text-2xl tracking-[12px]" />
                        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
                        <button className="w-full bg-orange-500 text-white py-6 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/10">Authorize Terminal</button>
                    </form>
                </motion.div>
            </div>
        );
    }

    if (loading) return <div className="min-h-screen bg-slate-950"><Navbar /><div className="flex items-center justify-center h-[calc(100vh-64px)]"><Loader /></div></div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20 overflow-x-hidden">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 pt-10">
                {/* Notifications Row */}
                <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnimatePresence>
                        {waiterCalls.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-red-500/10 border border-red-500/20 p-8 rounded-[40px] flex flex-col justify-between">
                                <div className="flex items-center space-x-3 mb-6 text-red-500 font-black uppercase tracking-widest text-xs">
                                    <BellRing className="w-5 h-5 animate-bounce" />
                                    <span>Waiter Calls</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {waiterCalls.map(call => (
                                        <button key={call.id} onClick={() => resolveCall(call.id)} className="bg-red-500 text-white px-6 py-2 rounded-xl font-black shadow-lg shadow-red-500/20 hover:scale-105 transition-all text-xs">Table #{call.table.table_number}</button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {billRequests.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[40px] flex flex-col justify-between">
                                <div className="flex items-center space-x-3 mb-6 text-orange-500 font-black uppercase tracking-widest text-xs">
                                    <Receipt className="w-5 h-5 animate-pulse" />
                                    <span>Bill Requests</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {billRequests.map(bill => (
                                        <button key={bill.id} onClick={() => setSelectedBill(bill)} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-black shadow-lg shadow-orange-500/20 hover:scale-105 transition-all text-xs flex items-center space-x-2">
                                            <span>Table #{bill.table_number}</span>
                                            <span className="bg-white/20 px-2 rounded-md">Rs. {bill.total_amount}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h1 className="text-6xl font-black text-white italic uppercase italic leading-none mb-2">Kitchen</h1>
                        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Real-time Order Stream</p>
                    </div>
                    <div className="flex bg-slate-900/50 p-2 rounded-3xl border border-slate-800">
                        {['pending', 'active', 'completed'].map(t => (
                            <button 
                                key={t} 
                                onClick={() => setActiveTab(t)} 
                                className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === t ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-slate-500 hover:text-slate-200'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-center">
                    <AnimatePresence mode="popLayout">
                        {filteredOrders.length > 0 ? (

                            filteredOrders.map(order => (
                                <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} onViewDetails={setSelectedOrder} />
                            ))
                        ) : (
                            <motion.div 
                                key={`empty-${activeTab}`}
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="col-span-full py-40 bg-slate-900/20 rounded-[80px] border border-slate-900 border-dashed flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-24 h-24 bg-slate-900 rounded-[40px] flex items-center justify-center mb-8 border border-slate-800">
                                    <Package className="w-10 h-10 text-slate-700" />
                                </div>
                                <h3 className="text-3xl font-black uppercase italic tracking-widest text-slate-700 mb-2">Queue Clear</h3>
                                <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">No {activeTab} orders at this moment</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

                <AnimatePresence>
                    {selectedBill && (
                        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 no-print">
                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-900 border border-slate-800 p-12 rounded-[60px] w-full max-w-lg shadow-3xl text-center print-card">
                                <h2 className="text-4xl font-black text-white italic uppercase italic mb-8 tracking-tighter">Table #{selectedBill.table_number} Bill</h2>
                                <div className="bg-slate-950 p-10 rounded-[40px] border border-slate-800 mb-10 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
                                    <span className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] block mb-2">Total Receivable</span>
                                    <span className="text-7xl font-black text-orange-500 tracking-tighter">Rs. {selectedBill.total_amount}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <button onClick={() => processPayment(selectedBill.session_id, 'CASH')} className="bg-slate-800 hover:bg-green-600 py-8 rounded-[32px] font-black transition-all flex flex-col items-center gap-3">
                                        <DollarSign className="w-8 h-8" />
                                        <span className="uppercase text-[10px] tracking-widest">Cash Payment</span>
                                    </button>
                                    <button onClick={() => processPayment(selectedBill.session_id, 'CARD')} className="bg-slate-800 hover:bg-blue-600 py-8 rounded-[32px] font-black transition-all flex flex-col items-center gap-3">
                                        <CreditCard className="w-8 h-8" />
                                        <span className="uppercase text-[10px] tracking-widest">Card Payment</span>
                                    </button>
                                </div>

                                <button 
                                    onClick={() => window.print()} 
                                    className="w-full bg-slate-100 text-slate-900 py-6 rounded-[32px] font-black flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl active:scale-95"
                                >
                                    <Receipt className="w-6 h-6" />
                                    <span className="uppercase text-xs tracking-widest">Print Full Invoice</span>
                                </button>

                                <button onClick={() => setSelectedBill(null)} className="mt-10 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">Dismiss Terminal</button>

                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default KitchenDashboard;
