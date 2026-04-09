import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Loader from '../components/Loader';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2,
  Filter,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [popularItems, setPopularItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revFilter, setRevFilter] = useState('7d'); // '7d', '30d', 'custom'
    const [customRevRange, setCustomRevRange] = useState({ start: '', end: '' });

    const fetchRevenueData = async () => {
        try {
            let params = {};
            if (revFilter === '7d') {
                const d = new Date(); d.setDate(d.getDate() - 7);
                params.startDate = d.toISOString();
            } else if (revFilter === '30d') {
                const d = new Date(); d.setDate(d.getDate() - 30);
                params.startDate = d.toISOString();
            } else if (revFilter === 'custom' && customRevRange.start) {
                params.startDate = new Date(customRevRange.start).toISOString();
                if (customRevRange.end) {
                    const d = new Date(customRevRange.end);
                    d.setHours(23, 59, 59, 999);
                    params.endDate = d.toISOString();
                }
            }

            const res = await api.get('/api/analytics/revenue', { params });
            setRevenueData(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, revenueRes, popularRes] = await Promise.all([
                    api.get('/api/analytics/summary'),
                    api.get('/api/analytics/revenue'),
                    api.get('/api/analytics/popular')
                ]);
                setSummary(summaryRes.data);
                setRevenueData(revenueRes.data);
                setPopularItems(popularRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) fetchRevenueData();
    }, [revFilter, customRevRange.start, customRevRange.end]);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader /></div>;

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#6366f1'];

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-white uppercase leading-none mb-2 tracking-tight">Overview</h1>
                    <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">Real-time business performance</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live Updates Enabled</span>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                  title="Daily Revenue" 
                  value={`Rs. ${summary?.totalRevenueToday || 0}`} 
                  icon={DollarSign} 
                  trend="+12%" 
                  color="orange" 
                />
                <StatCard 
                  title="Today's Orders" 
                  value={summary?.totalOrdersToday || 0} 
                  icon={ShoppingBag} 
                  trend="+5%" 
                  color="blue" 
                />
                <StatCard 
                  title="Active Queue" 
                  value={summary?.pendingOrders || 0} 
                  icon={Clock} 
                  color="purple" 
                />
                <StatCard 
                  title="Fulfilled" 
                  value={summary?.completedOrders || 0} 
                  icon={CheckCircle2} 
                  color="green" 
                />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ChartCard 
                  title="Revenue Trend" 
                  subtitle={revFilter === 'custom' ? `Custom Range: ${customRevRange.start} to ${customRevRange.end || 'Now'}` : `Showing last ${revFilter === '7d' ? '7' : '30'} days`}
                >
                    <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-950/50 p-2 rounded-2xl border border-slate-900 w-fit">
                        {['7d', '30d', 'custom'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setRevFilter(f)}
                                className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${revFilter === f ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {f}
                            </button>
                        ))}

                        {revFilter === 'custom' && (
                            <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-left-2">
                                <input 
                                    type="date" 
                                    value={customRevRange.start}
                                    onChange={e => setCustomRevRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="bg-slate-900 border border-slate-800 text-white p-2 rounded-lg text-[9px] font-bold outline-none focus:border-orange-500"
                                />
                                <span className="text-slate-700 font-bold text-[9px]">→</span>
                                <input 
                                    type="date" 
                                    value={customRevRange.end}
                                    onChange={e => setCustomRevRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="bg-slate-900 border border-slate-800 text-white p-2 rounded-lg text-[9px] font-bold outline-none focus:border-orange-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#64748b" 
                              fontSize={10} 
                              fontWeight="bold" 
                              axisLine={false} 
                              tickLine={false} 
                              tickFormatter={(str) => str.split('-')[2]}
                            />
                            <YAxis 
                              stroke="#64748b" 
                              fontSize={10} 
                              fontWeight="bold" 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} 
                              itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard 
                  title="Popular Picks" 
                  subtitle="Top 5 Best Selling Items"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={popularItems} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                            <XAxis type="number" hide />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              stroke="#64748b" 
                              fontSize={10} 
                              fontWeight="bold" 
                              axisLine={false} 
                              tickLine={false} 
                              width={120}
                            />
                            <Tooltip 
                              cursor={{fill: 'rgba(255,255,255,0.05)'}}
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} 
                            />
                            <Bar dataKey="total_orders" radius={[0, 12, 12, 0]}>
                                {popularItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </section>
        </div>
    );
};

export default AdminDashboard;
