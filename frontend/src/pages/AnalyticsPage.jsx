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
    const [forecastData, setForecastData] = useState([]);
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

    const fetchData = async () => {
        try {
            const [popRes, catRes, forecastRes] = await Promise.all([
                api.get('/api/analytics/popular'),
                api.get('/api/analytics/categories'),
                api.get('/api/analytics/daily-forecast')
            ]);
            setPopularItems(popRes.data);
            setCategoryStats(catRes.data);
            
            // Transform forecast data for Recharts
            const transformedForecast = forecastRes.data.map(d => {
                const entry = { day: d.day };
                d.topItems.forEach((item, idx) => {
                    entry[`avg${idx+1}`] = item.avg;
                    entry[`name${idx+1}`] = item.name;
                });
                return entry;
            });
            setForecastData(transformedForecast);

            await fetchRevenueData();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) fetchRevenueData();
    }, [revFilter, customRevRange.start, customRevRange.end]);

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
                    </div>
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

                <ChartCard 
                  title="Demand Forecasting" 
                  subtitle="Average top 3 items ordered by day of week (Last 6 Months)"
                  className="lg:col-span-2"
                >
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis 
                                  dataKey="day" 
                                  stroke="#64748b" 
                                  fontSize={10} 
                                  fontWeight="bold" 
                                  axisLine={false} 
                                  tickLine={false} 
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
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-2xl shadow-2xl">
                                                    <p className="text-white font-black uppercase tracking-tighter mb-2 italic">{label}</p>
                                                    <div className="space-y-1">
                                                        {payload.map((entry, index) => (
                                                            <div key={index} className="flex justify-between gap-4 text-[10px]">
                                                                <span className="text-slate-400 font-bold uppercase tracking-widest">{entry.payload[`name${index+1}`]}:</span>
                                                                <span className="text-orange-500 font-black">{entry.value} units</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend 
                                  verticalAlign="top" 
                                  align="right" 
                                  iconType="circle"
                                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', tracking: 'widest', paddingBottom: '20px' }}
                                  formatter={(value) => <span className="text-slate-500">{value.replace('avg', 'Rank ')}</span>}
                                />
                                <Bar dataKey="avg1" fill="#f97316" radius={[6, 6, 0, 0]} barSize={20} />
                                <Bar dataKey="avg2" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                                <Bar dataKey="avg3" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
};

export default AnalyticsPage;
