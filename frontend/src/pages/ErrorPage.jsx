import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-red-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 lg:p-16 rounded-[60px] shadow-2xl shadow-slate-200 max-w-md w-full text-center border-4 border-white"
      >
        <div className="w-32 h-32 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-red-100">
          <XCircle className="w-14 h-14 text-red-500 animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">Invalid Dining Key</h1>
        <p className="text-slate-500 font-medium mb-12 leading-relaxed px-4">
          The table session couldn't be verified. Please try scanning the physical QR code on your table again.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 hover:bg-orange-500 transition-all active:scale-95 shadow-xl shadow-slate-200 pr-10"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Retake Scan</span>
          </button>
          
          <Link 
            to="/"
            className="w-full bg-slate-100 text-slate-600 py-6 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 hover:bg-slate-200 transition-all pr-10"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
