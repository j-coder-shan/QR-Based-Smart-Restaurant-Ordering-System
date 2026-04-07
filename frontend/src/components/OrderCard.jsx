import { ChevronRight, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';

const OrderCard = ({ order, onUpdateStatus, onViewDetails }) => {
  const nextStatuses = {
    Pending: 'Accepted',
    Accepted: 'Preparing',
    Preparing: 'Ready',
    Ready: 'Delivered',
  };

  const nextStatus = nextStatuses[order?.status];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl hover:border-slate-700 transition-all group h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
           <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-2xl font-black text-white leading-none uppercase italic tracking-tighter">Table #{order?.table?.table_number || '??'}</h3>
                <button 
                  onClick={() => window.print()}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all active:scale-90"
                >
                    <Printer className="w-4 h-4" />
                </button>
           </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">ID: #{order?.id}</p>
        </div>

        <StatusBadge status={order?.status} />
      </div>

      <div className="space-y-3 mb-8 flex-1">
        {order?.orderItems?.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-bold">{item?.quantity} × {item?.menuItem?.name || 'Item'}</span>
            <span className="text-white font-black">${item?.subtotal || '0.00'}</span>
          </div>
        ))}
        <div className="border-t border-slate-800 pt-4 flex justify-between items-center mt-auto">
            <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Total Bill</span>
            <span className="text-xl font-black text-orange-500 italic">${order?.total_amount}</span>
        </div>
      </div>

      <div className="flex gap-4">
        {nextStatus && (
          <button onClick={() => onUpdateStatus(order.id, nextStatus)} className="flex-1 bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95">
            Mark as {nextStatus}
          </button>
        )}
        <button onClick={() => onViewDetails(order)} className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 transition-all active:scale-95">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default OrderCard;
