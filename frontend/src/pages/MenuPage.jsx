import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import MenuItemCard from '../components/MenuItemCard';
import Loader from '../components/Loader';
import { Utensils, Search, Filter, Sparkles, TrendingUp, History, Star, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [recommendations, setRecommendations] = useState({ popular: [], similar: [], frequent_pairs: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get('/api/menu');
        setMenu(response.data);
        
        // Phase 8: Fetch Recommendations
        const recResponse = await api.get('/api/recommendations');
        setRecommendations(recResponse.data);
      } catch (err) {
        console.error('Fetch menu error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const categories = ['All', ...new Set(menu.map(item => item.category))];
  const filteredMenu = menu.filter(item => 
    (filter === 'All' || item.category === filter) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="flex items-center justify-center h-[calc(100vh-64px)]"><Loader /></div></div>;

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-10">
        
        {/* Phase 8: Smart Recommendations Carousel */}
        {recommendations.popular.length > 0 && filter === 'All' && !searchTerm && (
          <section className="mb-20">
             <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col">
                   <div className="flex items-center space-x-2 text-orange-500 font-black uppercase text-xs tracking-widest mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Curated Just For You</span>
                   </div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase italic">Recommended for You</h2>
                </div>
                <div className="hidden md:flex items-center space-x-2 text-slate-400 font-bold text-sm">
                   <span>Swipe to explore</span>
                   <ChevronRight className="w-4 h-4" />
                </div>
             </div>

             <div className="flex overflow-x-auto pb-10 gap-8 no-scrollbar -mx-4 px-4 snap-x">
                {recommendations.popular.map(item => (
                   <div key={item.id} className="min-w-[300px] md:min-w-[400px] snap-start">
                      <MenuItemCard item={item} />
                   </div>
                ))}
             </div>
          </section>
        )}

        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
             <div className="flex flex-col">
                <span className="text-orange-500 font-black uppercase text-xs tracking-widest mb-1 italic">World Class Cravings</span>
                <h1 className="text-6xl font-black text-slate-900 leading-none italic uppercase italic">Our Menu</h1>
             </div>

             <div className="relative w-full md:w-96 group">
                <input 
                  type="text" placeholder="Search for flavors..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-[30px] focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 shadow-sm group-hover:shadow-lg"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-orange-500 transition-colors" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-full transition-all active:scale-95"><X className="w-4 h-4 text-slate-400" /></button>}
             </div>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-sm ${filter === cat ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{cat}</button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <AnimatePresence>
            {filteredMenu.map(item => <MenuItemCard key={item.id} item={item} />)}
          </AnimatePresence>
        </section>

        {filteredMenu.length === 0 && (
           <div className="py-40 flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-slate-50 rounded-[48px] flex items-center justify-center mb-10 shadow-sm">
                 <Search className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">No results for "{searchTerm}"</h3>
              <p className="text-slate-400 font-bold max-w-sm">We couldn't find exactly that, but try searching for categories like "Main" or "Sides".</p>
           </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;
