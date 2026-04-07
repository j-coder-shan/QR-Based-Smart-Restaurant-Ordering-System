import React from 'react';
import { Clock, CheckCircle2, Package, UserCheck, Flame, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const configs = {
    Pending: { color: 'bg-slate-100 text-slate-400', icon: Clock },
    Accepted: { color: 'bg-blue-100 text-blue-600', icon: UserCheck },
    Preparing: { color: 'bg-orange-100 text-orange-600', icon: Flame },
    Ready: { color: 'bg-green-100 text-green-600', icon: CheckCircle2 },
    Delivered: { color: 'bg-green-500 text-white', icon: Package },
    Completed: { color: 'bg-slate-950 text-white', icon: CheckCircle2 },
    Cancelled: { color: 'bg-red-100 text-red-600', icon: XCircle },
  };

  const config = configs[status] || configs.Pending;
  const Icon = config.icon;

  return (
    <div className={`${config.color} px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2`}>
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </div>
  );
};

export default StatusBadge;
