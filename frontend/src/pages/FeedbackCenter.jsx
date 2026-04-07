import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  Star, 
  MessageSquare, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Menu as MenuIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackCenter = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingFilter, setRatingFilter] = useState('all');

    const fetchFeedback = async () => {
        try {
            const res = await api.get('/api/feedback'); // I need to add this catch-all GET route to feedbackRoutes.js
            setFeedback(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const filteredFeedback = feedback.filter(f => 
        ratingFilter === 'all' ? true : f.rating === parseInt(ratingFilter)
    );

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader /></div>;

    const stats = {
        avg: (feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length || 0).toFixed(1),
        total: feedback.length,
        fiveStars: feedback.filter(f => f.rating === 5).length,
    };

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-6xl font-black text-white italic uppercase italic leading-none mb-2 tracking-tighter">Feedback</h1>
                    <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">Customer Satistaction monitoring</p>
                </div>

                <div className="flex bg-slate-900 p-2 rounded-[32px] border border-slate-800">
                    {['all', '5', '4', '3', '2', '1'].map(r => (
                        <button 
                            key={r} 
                            onClick={() => setRatingFilter(r)} 
                            className={`px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${ratingFilter === r ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-slate-500 hover:text-slate-200'}`}
                        >
                            {r === 'all' ? 'All' : `${r} ★`}
                        </button>
                    ))}
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] flex items-center space-x-6">
                    <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center">
                        <Star className="w-8 h-8 fill-orange-500" />
                    </div>
                    <div>
                        <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Global Average</span>
                        <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase italic leading-none">{stats.avg}</h3>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] flex items-center space-x-6">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Total Reviews</span>
                        <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase italic leading-none">{stats.total}</h3>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] flex items-center space-x-6 text-green-500">
                    <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Perfict Scores</span>
                        <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase italic leading-none">{stats.fiveStars}</h3>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredFeedback.map((f) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={f.id}
                        className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] relative group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl" />
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < f.rating ? 'text-orange-500 fill-orange-500' : 'text-slate-700'}`} 
                                    />
                                ))}
                            </div>
                            <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                {new Date(f.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <p className="text-slate-400 font-bold mb-8 leading-relaxed italic text-lg pr-4">"{f.comment || 'No comment provided'}"</p>

                        <div className="flex items-center space-x-3 pt-6 border-t border-slate-800/50">
                            <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center">
                                <MenuIcon className="w-4 h-4 text-slate-700" />
                            </div>
                            <div>
                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Reviewing</span>
                                <p className="font-black text-white uppercase italic tracking-tighter">{f.menuItem?.name || `Order #${f.order_id}`}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredFeedback.length === 0 && (
                    <div className="col-span-full py-40 border border-dashed border-slate-800 rounded-[80px] text-center">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-800 opacity-20" />
                        <h3 className="text-2xl font-black text-slate-700 uppercase italic italic tracking-widest">Silence</h3>
                        <p className="text-slate-800 font-extrabold uppercase tracking-widest text-[10px]">No feedback matches this criteria</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default FeedbackCenter;
