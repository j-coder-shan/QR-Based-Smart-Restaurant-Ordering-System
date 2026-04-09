import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import OrderCard from '../components/OrderCard';
import OrderDetailsModal from '../components/OrderDetailsModal';
import Loader from '../components/Loader';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  BellRing, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [waiterCalls, setWaiterCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'pending', 'active', 'completed'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [dateFilter, setDateFilter] = useState('today'); // 'today', 'yesterday', 'custom'
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const socket = useRef(null);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            let params = {};
            
            if (dateFilter === 'today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                params.startDate = today.toISOString();
            } else if (dateFilter === 'yesterday') {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                const endOfYesterday = new Date();
                endOfYesterday.setDate(endOfYesterday.getDate() - 1);
                endOfYesterday.setHours(23, 59, 59, 999);
                params.startDate = yesterday.toISOString();
                params.endDate = endOfYesterday.toISOString();
            } else if (dateFilter === 'custom' && customRange.start) {
                params.startDate = new Date(customRange.start).toISOString();
                if (customRange.end) {
                    const end = new Date(customRange.end);
                    end.setHours(23, 59, 59, 999);
                    params.endDate = end.toISOString();
                }
            }

            // NOTE: We only apply date filters to fetching if we are looking at completed orders 
            // OR if the user specifically requested a non-default filter.
            // For Pending/Active, we usually want to see ALL unresolved orders.
            // But let's follow the user's lead: "Filter Orders... Filter by Date"
            
            const [ordersRes, callsRes] = await Promise.all([
                api.get('/api/orders', { params }),
                api.get('/api/waiter-call')
            ]);
            setOrders(ordersRes.data);
            setWaiterCalls(callsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [dateFilter, customRange.start, customRange.end]);

    useEffect(() => {
        // Socket.io Setup
        socket.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        const restaurantId = localStorage.getItem('restaurantId');
        
        if (restaurantId) {
            socket.current.emit('join-restaurant', restaurantId);
        }

        socket.current.on('newOrder', (order) => {
            setOrders(prev => [order, ...prev]);
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
        });

        socket.current.on('orderStatusUpdate', (updatedOrder) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        });

        socket.current.on('newWaiterCall', (call) => {
            setWaiterCalls(prev => [call, ...prev]);
        });

        socket.current.on('waiterCallResolved', ({ id }) => {
            setWaiterCalls(prev => prev.filter(c => c.id !== id));
        });

        socket.current.on('lowStock', ({ name, stock }) => {
            // Notification for low stock
            alert(`LOW STOCK ALERT: ${name} is at ${stock} units.`);
        });

        return () => socket.current.disconnect();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
            // Local state update is handled by socket event usually, 
            // but we can update immediately for better responsiveness
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

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.table?.table_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             o.id.toString().includes(searchTerm);
        
        if (!matchesSearch) return false;

        if (activeTab === 'pending') return o.status === 'Pending';
        if (activeTab === 'active') return ['Accepted', 'Preparing', 'Ready', 'Delivered'].includes(o.status);
        if (activeTab === 'completed') return o.status === 'Completed';
        return true;
    });

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader /></div>;

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-6xl font-black text-white italic uppercase italic leading-none mb-2 tracking-tighter">Live Orders</h1>
                    <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">Real-time management stream</p>
                </div>

                <div className="flex bg-slate-900 p-2 rounded-[32px] border border-slate-800">
                    {['pending', 'active', 'completed'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => setActiveTab(t)} 
                            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-slate-500 hover:text-slate-200'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            {/* Notifications Grid */}
            <AnimatePresence>
                {(waiterCalls.length > 0) && (
                    <motion.section 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {waiterCalls.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[40px] flex flex-col justify-between">
                                <div className="flex items-center space-x-3 mb-6 text-red-500 font-black uppercase tracking-widest text-xs">
                                    <BellRing className="w-5 h-5 animate-bounce" />
                                    <span>Waiter Calls</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {waiterCalls.map(call => (
                                        <button 
                                          key={call.id} 
                                          onClick={() => resolveCall(call.id)} 
                                          className="bg-red-500 text-white px-6 py-2 rounded-xl font-black shadow-lg shadow-red-500/20 hover:scale-105 transition-all text-xs"
                                        >
                                          Table #{call.table?.table_number}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Filter & Search Section */}
            <section className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search by Table or Order ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white p-6 pl-16 rounded-[32px] outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold tracking-widest uppercase text-xs"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-slate-950 p-2 rounded-[32px] border border-slate-900">
                        <div className="flex p-1 bg-slate-900 rounded-2xl border border-slate-800">
                            {['today', 'yesterday', 'custom'].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setDateFilter(f)}
                                    className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${dateFilter === f ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-400'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2 px-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <input 
                                    type="date" 
                                    value={customRange.start}
                                    onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-[10px] font-bold outline-none focus:border-orange-500"
                                />
                                <span className="text-slate-700 font-bold">to</span>
                                <input 
                                    type="date" 
                                    value={customRange.end}
                                    onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-[10px] font-bold outline-none focus:border-orange-500"
                                />
                            </div>
                        )}
                        
                        <div className="px-4 border-l border-slate-900 flex items-center space-x-2 text-slate-500">
                            <Filter className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                                {dateFilter === 'today' ? "Showing Today" : 
                                 dateFilter === 'yesterday' ? "Showing Yesterday" : 
                                 customRange.start ? `${customRange.start} → ${customRange.end || 'Now'}` : "Select Range"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <OrderCard 
                                  key={order.id} 
                                  order={order} 
                                  onUpdateStatus={updateStatus} 
                                  onViewDetails={setSelectedOrder} 
                                />
                            ))
                        ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="col-span-full py-40 bg-slate-950 rounded-[80px] border border-slate-900 border-dashed flex flex-col items-center justify-center text-center text-slate-700"
                                >
                                    <ClipboardList className="w-16 h-16 mb-4 opacity-20" />
                                    <h3 className="text-2xl font-black uppercase italic tracking-widest">Queue Clear</h3>
                                    <p className="font-bold text-[10px] mt-2 tracking-widest">No matching orders found</p>
                                </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div>
    );
};

export default OrdersPage;
