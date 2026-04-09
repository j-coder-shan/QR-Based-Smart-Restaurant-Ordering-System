import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color = 'orange' }) => {
  const colors = {
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-500 border-orange-500/20',
    green: 'from-green-500/20 to-green-500/5 text-green-500 border-green-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-500 border-purple-500/20',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-900 border ${colors[color].split(' ')[3]} p-8 rounded-[40px] relative overflow-hidden group hover:scale-[1.02] transition-transform`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color].split(' ').slice(0, 2).join(' ')} blur-3xl -z-10`} />
      
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-slate-950 border ${colors[color].split(' ')[3]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-3 py-1 rounded-full bg-white/5 border border-white/10 uppercase tracking-widest ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
          </span>
        )}
      </div>

      <h3 className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <span className="text-4xl font-black text-white tracking-tighter leading-none italic uppercase italic">{value}</span>
      </div>
    </motion.div>
  );
};

export default StatCard;
