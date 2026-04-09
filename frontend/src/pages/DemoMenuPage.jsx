import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MenuItemCard from '../components/MenuItemCard';
import { Utensils, Search, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DemoMenuPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const dummyMenu = [
    {
      id: 'd1',
      name: 'Truffle Penne Arrabbiata',
      price: 18.50,
      description: 'Slow-cooked spicy tomato sauce, fresh basil, and a generous shaving of black winter truffles.',
      category: 'Pasta',
      image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      prep_time: 20,
      avg_rating: 4.9,
      review_count: 124,
      total_orders: 450
    },
    {
      id: 'd2',
      name: 'The Royal Wagyu Burger',
      price: 24.00,
      description: 'Hand-pressed Wagyu beef, white cheddar, caramelized onions, and our signature truffle aioli.',
      category: 'Burgers',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      prep_time: 15,
      avg_rating: 4.8,
      review_count: 89,
      total_orders: 320
    },
    {
      id: 'd3',
      name: 'Classic Caesar Royale',
      price: 14.50,
      description: 'Crisp romaine hearts, sourdough croutons, shaved parmesan, and house-made creamy dressing.',
      category: 'Salads',
      image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80',
      prep_time: 10,
      avg_rating: 4.7,
      review_count: 56,
      total_orders: 150
    },
    {
      id: 'd4',
      name: 'Miso-Glazed Arctic Salmon',
      price: 28.00,
      description: 'Pan-seared salmon fillet over ginger-infused jasmine rice and sautéed seasonal greens.',
      category: 'Mains',
      image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
      prep_time: 25,
      avg_rating: 4.9,
      review_count: 72,
      total_orders: 210
    },
    {
      id: 'd5',
      name: 'Molten Chocolate Lava',
      price: 12.00,
      description: 'Warm liquid-center dark chocolate cake served with Madagascar vanilla bean gelato.',
      category: 'Desserts',
      image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80',
      prep_time: 12,
      avg_rating: 5.0,
      review_count: 210,
      total_orders: 680
    },
    {
      id: 'd6',
      name: 'Mango Passion Smoothie',
      price: 9.00,
      description: 'Fresh tropical mango blended with passionfruit, cold-pressed pineapple juice, and coconut water.',
      category: 'Drinks',
      image_url: 'https://images.unsplash.com/photo-1553530666-ba01af7794b6?auto=format&fit=crop&w=800&q=80',
      prep_time: 5,
      avg_rating: 4.6,
      review_count: 45,
      total_orders: 190
    }
  ];

  const filteredMenu = dummyMenu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      {/* Demo Banner */}
      <div className="bg-orange-950 text-white py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Preview Mode: Exploratory Menu Only</span>
          <div className="hidden md:block w-px h-4 bg-white/10 mx-4" />
          <button 
            onClick={() => navigate('/register')}
            className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 hover:text-white transition-colors"
          >
            Own this restaurant? Register Now
          </button>
        </div>
      </div>

      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-10">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="flex flex-col">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-slate-400 font-black uppercase text-[10px] tracking-widest mb-4 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
              <span className="text-orange-500 font-black uppercase text-xs tracking-widest mb-1 italic">Exquisite Selection</span>
              <h1 className="text-6xl font-black text-slate-900 leading-none italic uppercase italic">Demo Menu</h1>
            </div>

            <div className="relative w-full md:w-96 group">
                <input 
                  type="text" placeholder="Search preview items..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-[30px] focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 shadow-sm group-hover:shadow-lg"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-orange-500 transition-colors" />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <AnimatePresence>
            {filteredMenu.map(item => (
              <MenuItemCard key={item.id} item={item} isDemo={true} />
            ))}
          </AnimatePresence>
        </section>

        <div className="mt-24 p-12 bg-slate-950 rounded-[60px] text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
           
           <h3 className="text-4xl font-black text-white mb-6 uppercase italic tracking-tight">Ready to transform your restaurant?</h3>
           <p className="text-slate-400 font-bold mb-10 max-w-lg mx-auto leading-relaxed">
             This is just a preview. The full system includes real-time order processing, secure payments, and a powerful admin dashboard.
           </p>
           <button 
             onClick={() => navigate('/register')}
             className="bg-orange-500 text-white px-12 py-6 rounded-3xl font-black text-xl hover:bg-white hover:text-slate-900 transition-all active:scale-95 shadow-2xl shadow-orange-500/20"
           >
             Start Your 7-Day Free Trial
           </button>
        </div>
      </main>
    </div>
  );
};

export default DemoMenuPage;
