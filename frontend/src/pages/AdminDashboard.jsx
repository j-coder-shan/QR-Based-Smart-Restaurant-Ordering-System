import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Loader from '../components/Loader';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2
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

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader /></div>;

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#6366f1'];

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-6xl font-black text-white italic uppercase italic leading-none mb-2 tracking-tighter">Overview</h1>
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
                  subtitle="Last 7 Days Earnings"
                >
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
