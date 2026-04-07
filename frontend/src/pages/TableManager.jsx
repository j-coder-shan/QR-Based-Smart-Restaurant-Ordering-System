import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  Download, 
  Monitor, 
  Users, 
  Table as TableIcon,
  Search,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
const QRCodeComponent = QRCode.default || QRCode;

const TableManager = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTable, setNewTable] = useState({ table_number: '', capacity: 2 });

    const fetchTables = async () => {
        try {
            const res = await api.get('/api/tables');
            setTables(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleCreateTable = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/tables', newTable);
            fetchTables();
            setIsModalOpen(false);
            setNewTable({ table_number: '', capacity: 2 });
        } catch (err) {
            alert(err.response?.data?.error || "Creation failed");
        }
    };

    const handleRegenerate = async (id) => {
        if (!window.confirm('Regenerating QR will invalidate the current one. Continue?')) return;
        try {
            await api.put(`/api/tables/${id}/regenerate`);
            fetchTables();
        } catch (err) {
            alert("Regeneration failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this table permanently?')) return;
        try {
            await api.delete(`/api/tables/${id}`);
            setTables(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            alert("Deletion failed");
        }
    };

    const downloadQR = (tableNumber) => {
        const svg = document.getElementById(`qr-code-${tableNumber}`);
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `Table-${tableNumber}-QR.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const filteredTables = tables.filter(t => 
        t.table_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader /></div>;

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-6xl font-black text-white italic uppercase italic leading-none mb-2 tracking-tighter">Tables</h1>
                    <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">Physical Layout & QR Management</p>
                </div>

                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-500 text-white px-8 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-orange-500/20 flex items-center space-x-3"
                >
                    <Plus className="w-4 h-4" />
                    <span>Deploy New Table</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTables.map((table) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={table.id}
                        className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl" />
                        
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                <TableIcon className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleRegenerate(table.id)}
                                  className="p-3 bg-slate-950 border border-slate-800 text-slate-500 rounded-xl hover:text-white transition-all"
                                  title="Regenerate QR"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(table.id)}
                                  className="p-3 bg-slate-950 border border-slate-800 text-slate-500 rounded-xl hover:text-red-500 transition-all"
                                  title="Remove Table"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-8 mb-8">
                            <div className="bg-white p-3 rounded-2xl shadow-2xl group-hover:scale-105 transition-transform">
                                <QRCodeComponent 
                                  id={`qr-code-${table.table_number}`}
                                  value={`${window.location.origin}/scan?table=${table.table_number}&token=${table.qr_token}`}
                                  size={100}
                                  level="H"
                                />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-white italic uppercase italic leading-none mb-2 tracking-tighter">#{table.table_number}</h3>
                                <div className="flex items-center space-x-3 text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{table.capacity} Capacity</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => downloadQR(table.table_number)}
                                className="bg-slate-950 border border-slate-800 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-white hover:text-slate-900 transition-all"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Save QR</span>
                            </button>
                            <a 
                                href={`${window.location.origin}/scan?table=${table.table_number}&token=${table.qr_token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-slate-950 border border-slate-800 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-orange-500/0 hover:shadow-orange-500/10"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open</span>
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }} 
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-slate-900 border border-slate-800 p-12 rounded-[60px] w-full max-w-md shadow-3xl"
                        >
                            <h2 className="text-4xl font-black text-white italic uppercase italic mb-8 tracking-tighter">Deploy Table</h2>
                            <form onSubmit={handleCreateTable} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Table Identifier (e.g. T05)</label>
                                    <input 
                                      type="text" 
                                      value={newTable.table_number}
                                      onChange={e => setNewTable({...newTable, table_number: e.target.value})}
                                      className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl text-lg font-black uppercase italic italic text-white outline-none focus:border-orange-500" 
                                      required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Seating Capacity</label>
                                    <input 
                                      type="number" 
                                      value={newTable.capacity}
                                      onChange={e => setNewTable({...newTable, capacity: e.target.value})}
                                      className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl text-lg font-black uppercase italic italic text-white outline-none focus:border-orange-500" 
                                      required
                                    />
                                </div>
                                
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <button 
                                      type="button" 
                                      onClick={() => setIsModalOpen(false)}
                                      className="text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                      type="submit" 
                                      className="bg-orange-500 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                                    >
                                        Confirm Entry
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TableManager;
