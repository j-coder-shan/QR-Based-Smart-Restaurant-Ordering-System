import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 text-center space-y-6">
        <div className="bg-primary/10 w-20 h-20 mx-auto rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Smart Dine-In</h1>
        <p className="text-slate-500 text-sm">
          Welcome to our intelligent restaurant ordering experience. Scan the QR code on your table to get started.
        </p>
        
        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
          <button className="w-full py-4 px-6 bg-primary text-white rounded-xl font-semibold shadow-md shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg">
            Scan Table QR
          </button>
          
          <button className="w-full py-4 px-6 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold transition-all hover:bg-slate-50 active:bg-slate-100 text-lg">
            View Sample Menu
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs text-center max-w-sm">
        Powered by Intelligent Restaurant Ordering System. Phase 1 setup running successfully.
      </p>
    </div>
  );
};

export default LandingPage;
