import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center p-20 gap-8">
            <div className="relative w-24 h-24">
                <motion.div 
                    initial={{ rotate: 0 }} 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-[10px] border-slate-100 rounded-full"
                />
                <motion.div 
                    initial={{ rotate: 0 }} 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 border-[10px] border-orange-500 rounded-full border-t-transparent"
                />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Kitchen Syncing...</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Fetching fresh data</p>
            </div>
        </div>
    );
};

export default Loader;
