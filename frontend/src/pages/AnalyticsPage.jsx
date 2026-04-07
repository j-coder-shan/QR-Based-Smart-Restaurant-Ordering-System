import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import ChartCard from '../components/ChartCard';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, PieChart as PieIcon } from 'lucide-react';

const AnalyticsPage = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [popularItems, setPopularItems] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [revRes, popRes, catRes] = await Promise.all([
                api.get('/api/analytics/revenue'),
                api.get('/api/analytics/popular'),
                api.get('/api/analytics/categories')
            ]);
            setRevenueData(revRes.data);
            setPopularItems(popRes.data);
            setCategoryStats(catRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader /></div>;

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#eab308'];

    return (
        <div className="space-y-12 pb-20">
            <header>
                <h1 className="text-6xl font-black text-white italic uppercase italic leading-none mb-2 tracking-tighter">Business Intelligence</h1>
                <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">Data-driven insights & performance metrics</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Revenue Line Chart */}
                <ChartCard 
                  title="Revenue Momentum" 
                  subtitle="Daily gross revenue for the last 7 days"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
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
                            />
                            <Line 
                              type="monotone" 
                              dataKey="revenue" 
                              stroke="#f97316" 
                              strokeWidth={4} 
                              dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} 
                              activeDot={{ r: 8 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Category Pie Chart */}
                <ChartCard 
                  title="Category Volume" 
                  subtitle="Order distribution by food category"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryStats}
                                dataKey="_sum.total_orders"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                            >
                                {categoryStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} 
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Popular Items Bar Chart */}
                <ChartCard 
                  title="Culinary Performance" 
                  subtitle="Top menu items by order count"
                  className="lg:col-span-2"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={popularItems}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#64748b" 
                              fontSize={10} 
                              fontWeight="bold" 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <Tooltip 
                              cursor={{fill: 'rgba(255,255,255,0.05)'}}
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} 
                            />
                            <Bar dataKey="total_orders" radius={[12, 12, 0, 0]}>
                                {popularItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

export default AnalyticsPage;
