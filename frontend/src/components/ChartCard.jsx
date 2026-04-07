import React from 'react';
import { motion } from 'framer-motion';

const ChartCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-slate-900 border border-slate-800 p-10 rounded-[60px] shadow-2xl relative overflow-hidden group ${className}`}
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-transparent opacity-30" />
      
      <div className="mb-10">
        <h3 className="text-3xl font-black text-white italic uppercase italic leading-none mb-2 tracking-tighter">{title}</h3>
        {subtitle && <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">{subtitle}</p>}
      </div>

      <div className="h-[300px] w-full mt-4">
        {children}
      </div>
    </motion.div>
  );
};

export default ChartCard;
