import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { useSession } from '../context/SessionContext';
import { Star, MessageSquare, Send, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackItem = ({ item, orderId, sessionId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setStatus('submitting');
    try {
      await api.post('/api/feedback', {
        session_id: sessionId,
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        rating,
        comment
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit feedback');
      setStatus('error');
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100 overflow-hidden"
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden">
           {item.menuItem?.image_url ? (
             <img src={item.menuItem.image_url} alt={item.menuItem.name} className="w-full h-full object-cover" />
           ) : (
             <ShoppingBag className="w-6 h-6 text-slate-300" />
           )}
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-lg">{item.menuItem?.name}</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Rate this dish</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-4 text-center"
          >
            <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-black text-green-600">Thanks for your feedback!</p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, scale: 0.9 }}>
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform active:scale-90"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      star <= (hover || rating) 
                        ? 'fill-orange-500 text-orange-500' 
                        : 'text-slate-200'
                    }`} 
                  />
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <div className="absolute left-4 top-4">
                <MessageSquare className="w-5 h-5 text-slate-300" />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional: How was the taste? (Max 200 chars)"
                maxLength={200}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20 h-24 resize-none transition-all font-medium"
              />
            </div>

            {error && <p className="text-red-500 text-xs font-black mb-4 px-2 tracking-tight">⚠️ {error}</p>}

            <button
              onClick={handleSubmit}
              disabled={status === 'submitting'}
              className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center space-x-2 transition-all active:scale-95 ${
                status === 'submitting' 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-orange-500 shadow-lg shadow-slate-200'
              }`}
            >
              <span>{status === 'submitting' ? 'Sending...' : 'Submit Review'}</span>
              <Send className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FeedbackPage = () => {
  const { orderId } = useParams();
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader />
      </div>
    </div>
  );

  if (!order) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-orange-500 fill-orange-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Your Feedback</h1>
          <p className="text-slate-500 font-bold max-w-xs mx-auto">Help us improve by rating the items you just enjoyed!</p>
        </motion.div>

        <div className="space-y-6">
          {order.orderItems?.map((item) => (
            <FeedbackItem 
              key={item.id} 
              item={item} 
              orderId={order.id} 
              sessionId={sessionId || order.session_id} // Fallback if sessionId from context is nulled
            />
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/')}
          className="w-full mt-8 py-5 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-lg flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all active:scale-95"
        >
          <span>Skip & Go Home</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </main>
    </div>
  );
};

export default FeedbackPage;
