import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { useSession } from '../context/SessionContext';
import { Clock, CheckCircle2, ChevronRight, CookingPot, Package, UserCheck, Flame, BellRing, ShoppingBag, Check, RotateCcw, Receipt, Download, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusStep = ({ icon: Icon, label, status, isActive, isCompleted }) => (
  <div className={`flex items-center space-x-4 mb-8 transition-all ${isActive ? 'scale-105 origin-left' : 'opacity-40'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
      isCompleted ? 'bg-green-500 text-white' : 
      isActive ? 'bg-orange-500 text-white animate-pulse' : 
      'bg-slate-100 text-slate-400'
    }`}>
      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
    </div>
    <div className="flex-1">
      <h3 className={`font-black uppercase tracking-widest text-[10px] mb-1 ${isActive ? 'text-orange-500' : 'text-slate-400'}`}>
        {isCompleted ? 'Done' : isActive ? 'Processing' : 'Next Up'}
      </h3>
      <p className={`font-black text-lg ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{label}</p>
    </div>
  </div>
);

const OrderStatusPage = () => {
  const { id } = useParams();
  const { sessionId, endSession } = useSession();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState('idle');
  const [requestingBill, setRequestingBill] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get(`/api/orders/${id}`);
        setOrder(response.data);
        
        // Phase 10: Check session status
        const billRes = await api.get(`/api/payments/bill/${sessionId}`);
        setBill(billRes.data);

        if (!billRes.data.is_active) {
            // Session closed after payment
            endSession();
            navigate(`/feedback/${id}`);
        }
      } catch (err) {
        console.error('Fetch status error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [id, sessionId]);

  const handleCallWaiter = async () => {
    if (!sessionId) return;
    setCallStatus('calling');
    try {
      await api.post('/api/waiter-call', { session_id: sessionId });
      setCallStatus('success');
      setTimeout(() => setCallStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setCallStatus('idle');
    }
  };

  const handleRequestBill = async () => {
    setRequestingBill(true);
    try {
      await api.post('/api/payments/request-bill', { session_id: sessionId });
      // Refresh bill status
      const billRes = await api.get(`/api/payments/bill/${sessionId}`);
      setBill(billRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingBill(false);
    }
  };

  const steps = [
    { label: 'Order Received', status: 'Pending', icon: ShoppingBag },
    { label: 'Chef Accepted', status: 'Accepted', icon: UserCheck },
    { label: 'Cooking Now', status: 'Preparing', icon: CookingPot },
    { label: 'Ready for Table', status: 'Ready', icon: Flame },
    { label: 'Served Hot', status: 'Delivered', icon: Package },
  ];

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return steps.findIndex(step => step.status === order.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 pt-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-12">
          <div className="w-40 h-40 bg-white rounded-[40px] shadow-2xl mx-auto flex items-center justify-center mb-8 relative border-4 border-slate-50">
            <span className="text-7xl relative z-10">{order.status === 'Delivered' ? '😋' : '🥘'}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Order Status</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tracking ID: #{order.id}</p>
        </motion.div>

        {order.status !== 'Delivered' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-[40px] p-8 mb-12 shadow-2xl flex items-center justify-between overflow-hidden relative">
            <div className="text-left relative z-10">
              <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest block mb-1">Queue-Aware ETA</span>
              <span className="text-4xl font-black text-orange-500">{order.estimated_time || 20}</span>
              <span className="text-xl font-black text-orange-500 ml-1">mins</span>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-500 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-[40px] p-10 text-left shadow-sm border border-slate-50 mb-10 overflow-hidden">
          <h2 className="text-xl font-black text-slate-900 mb-10 pb-6 border-b border-slate-50">Kitchen Timeline</h2>
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-1 bg-slate-100 -translate-x-1/2" />
            {steps.map((step, index) => (
              <StatusStep 
                key={index} 
                {...step} 
                isActive={index === currentStepIndex}
                isCompleted={index < currentStepIndex || order.status === 'Completed'}
              />
            ))}
          </div>
        </div>

        {/* Phase 10: Payment & Billing Section */}
        {bill && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] p-10 text-left shadow-sm border border-slate-50 mb-10 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-900">Bill Summary</h2>
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${bill.bill_requested ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                        {bill.bill_requested ? 'Bill Requested' : 'Ongoing'}
                    </span>
                </div>

                <div className="space-y-4 mb-8">
                   {bill.items.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-center text-sm">
                           <span className="font-bold text-slate-600">{item.name} × {item.quantity}</span>
                           <span className="font-black text-slate-900">Rs. {item.subtotal}</span>
                       </div>
                   ))}
                   <div className="border-t border-slate-50 pt-4 flex justify-between items-center">
                       <span className="text-lg font-black text-slate-900">Payable Total</span>
                       <span className="text-2xl font-black text-orange-500">Rs. {bill.total_amount}</span>
                   </div>
                </div>

                {!bill.bill_requested ? (
                    <button 
                        onClick={handleRequestBill}
                        disabled={requestingBill}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 hover:bg-orange-500 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        <Receipt className="w-5 h-5" />
                        <span>{requestingBill ? 'Requesting...' : 'Request Bill'}</span>
                    </button>
                ) : (
                    <button 
                        onClick={() => window.print()}
                        className="w-full bg-green-500 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-200"
                    >
                        <Download className="w-5 h-5" />
                        <span>Download/Print Invoice</span>
                    </button>
                )}
             </motion.div>
        )}

        <div className="flex flex-col space-y-4">
          <button 
            onClick={handleCallWaiter}
            disabled={callStatus !== 'idle'}
            className={`w-full py-6 rounded-2xl font-black flex items-center justify-center space-x-3 transition-all active:scale-95 leading-none px-10 ${
              callStatus === 'success' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {callStatus === 'calling' ? (
              <RotateCcw className="w-5 h-5 animate-spin" />
            ) : callStatus === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <BellRing className="w-5 h-5 text-orange-500" />
            )}
            <span>{callStatus === 'success' ? 'Waiter Notified' : callStatus === 'calling' ? 'Calling...' : 'Call Waiter'}</span>
          </button>
          
          {order.status === 'Delivered' && (
             <Link to="/menu" className="w-full bg-orange-500 text-white py-6 rounded-2xl font-black shadow-lg shadow-orange-200 flex items-center justify-center space-x-3 transition-all active:scale-95 leading-none pr-10">
              <span>Order More</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderStatusPage;
