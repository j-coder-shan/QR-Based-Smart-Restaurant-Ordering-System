import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  Utensils, 
  DollarSign, 
  Package, 
  Clock,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/urlUtils';

const MenuManager = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        low_stock_threshold: 5,
        is_available: true,
        prep_time: 15,
        image: null
    });
    const [categories, setCategories] = useState([]);
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const fetchMenu = async () => {
        try {
            const res = await api.get('/api/menu');
            setMenuItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/menu/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMenu();
        fetchCategories();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            low_stock_threshold: 5,
            is_available: true,
            prep_time: 15,
            image: null
        });
        setEditingItem(null);
        setIsModalOpen(false);
        setIsAddingNewCategory(false);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category || '',
            stock: item.stock,
            low_stock_threshold: item.low_stock_threshold,
            is_available: item.is_available,
            prep_time: item.prep_time,
            image: null
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'image' && formData[key]) {
                data.append('image', formData[key]);
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingItem) {
                await api.put(`/api/menu/${editingItem.id}`, data);
            } else {
                await api.post('/api/menu', data);
            }
            fetchMenu();
            fetchCategories();
            resetForm();
        } catch (err) {
            alert(err.response?.data?.error || "Submission failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item permanently?')) return;
        try {
            await api.delete(`/api/menu/${id}`);
            setMenuItems(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            alert(err.response?.data?.error || "Deletion failed");
        }
    };

    const handleDeleteCategory = async (categoryName) => {
        if (!window.confirm(`WARNING: Deleting the category "${categoryName}" will also DELETE ALL FOOD ITEMS listed under it permanently. Proceed?`)) return;
        
        try {
            await api.delete(`/api/menu/categories/${encodeURIComponent(categoryName)}`);
            fetchMenu();
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.error || "Category deletion failed");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await api.post('/api/menu/categories', { name: newCategoryName.trim() });
            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add category");
        }
    };

    const filteredItems = menuItems.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        i.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader /></div>;

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-6xl font-black text-white italic uppercase italic leading-none mb-2 tracking-tighter">Menu Control</h1>
                    <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">Inventory & Catalog Management</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsManageCategoriesOpen(true)}
                        className="bg-slate-900 border border-slate-800 text-slate-400 px-8 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 hover:text-white"
                    >
                        <Settings className="w-4 h-4 mr-2 inline" />
                        Manage Categories
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-orange-500 text-white px-8 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-orange-500/20 flex items-center space-x-3"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Item</span>
                    </button>
                </div>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-[60px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-3xl -z-10" />

                <div className="relative mb-10">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="SEARCH CATALOG..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white p-6 pl-16 rounded-[32px] outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold tracking-widest uppercase text-xs"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-800">
                                <th className="pb-6 pl-4">Item</th>
                                <th className="pb-6">Category</th>
                                <th className="pb-6 text-center">Price</th>
                                <th className="pb-6 text-center">Stock</th>
                                <th className="pb-6 text-center">Status</th>
                                <th className="pb-6 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-6 pl-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
                                                {item.image_url ? (
                                                  <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                                                ) : <Utensils className="w-5 h-5 text-slate-700" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-white italic uppercase tracking-tighter text-lg">{item.name}</p>
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{item.prep_time}m prep</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className="bg-slate-950 border border-slate-800 px-4 py-1.5 rounded-lg text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                                            {item.category || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-6 text-center font-black text-orange-500">Rs. {item.price}</td>
                                    <td className="py-6 text-center">
                                        <div className={`flex flex-col items-center ${item.stock < 5 ? 'text-red-500' : 'text-slate-300'}`}>
                                            <span className="font-black italic uppercase italic text-lg">{item.stock}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">PCS</span>
                                        </div>
                                    </td>
                                    <td className="py-6 text-center">
                                        {item.is_available ? (
                                            <div className="flex items-center justify-center space-x-1.5 text-green-500">
                                                <Eye className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Live</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center space-x-1.5 text-slate-600">
                                                <EyeOff className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Hidden</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-6 text-right pr-4">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button 
                                              onClick={() => handleEdit(item)}
                                              className="p-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl hover:text-white hover:border-orange-500 hover:bg-orange-500 transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                              onClick={() => handleDelete(item.id)}
                                              className="p-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl hover:text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }} 
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-slate-900 border border-slate-800 p-12 rounded-[60px] w-full max-w-2xl shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar"
                        >
                            <h2 className="text-4xl font-black text-white italic uppercase italic mb-8 tracking-tighter">
                                {editingItem ? 'Modify Item' : 'New Creation'}
                            </h2>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Name</label>
                                        <input 
                                          type="text" 
                                          value={formData.name} 
                                          onChange={e => setFormData({...formData, name: e.target.value})}
                                          className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-orange-500" 
                                          required 
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Category</label>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setIsAddingNewCategory(!isAddingNewCategory);
                                                    if (!isAddingNewCategory) setFormData({...formData, category: ''});
                                                }}
                                                className="text-orange-500 text-[10px] font-black uppercase tracking-widest hover:underline"
                                            >
                                                {isAddingNewCategory ? 'Select Existing' : '+ Add New'}
                                            </button>
                                        </div>
                                        {isAddingNewCategory ? (
                                            <input 
                                                type="text" 
                                                value={formData.category} 
                                                onChange={e => setFormData({...formData, category: e.target.value})}
                                                placeholder="ENTER NEW CATEGORY NAME"
                                                className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-orange-500 uppercase"
                                                required
                                            />
                                        ) : (
                                            <select 
                                                value={formData.category} 
                                                onChange={e => setFormData({...formData, category: e.target.value})}
                                                className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-orange-500 appearance-none uppercase"
                                                required
                                            >
                                                <option value="" disabled>SELECT CATEGORY</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col space-y-2">
                                            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Price (Rs.)</label>
                                            <input 
                                              type="number" 
                                              step="0.01" 
                                              value={formData.price} 
                                              onChange={e => setFormData({...formData, price: e.target.value})}
                                              className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-orange-500" 
                                              required 
                                            />
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Stock</label>
                                            <input 
                                              type="number" 
                                              value={formData.stock} 
                                              onChange={e => setFormData({...formData, stock: e.target.value})}
                                              className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-orange-500" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Description</label>
                                        <textarea 
                                          rows="3" 
                                          value={formData.description} 
                                          onChange={e => setFormData({...formData, description: e.target.value})}
                                          className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-orange-500 resize-none" 
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Prep Time (min)</label>
                                        <input 
                                          type="number" 
                                          value={formData.prep_time} 
                                          onChange={e => setFormData({...formData, prep_time: e.target.value})}
                                          className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-orange-500" 
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Available for Sale</label>
                                        <input 
                                          type="checkbox" 
                                          checked={formData.is_available} 
                                          onChange={e => setFormData({...formData, is_available: e.target.checked})}
                                          className="w-5 h-5 accent-orange-500" 
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Item Image</label>
                                    <div className="flex items-center space-x-6">
                                        <div className="w-24 h-24 bg-slate-950 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                                            {formData.image ? (
                                              <img src={URL.createObjectURL(formData.image)} className="w-full h-full object-cover" />
                                            ) : editingItem && editingItem.image_url ? (
                                              <img src={getImageUrl(editingItem.image_url)} className="w-full h-full object-cover" />
                                            ) : <Plus className="text-slate-800 w-8 h-8" />}
                                        </div>
                                        <input 
                                          type="file" 
                                          onChange={e => setFormData({...formData, image: e.target.files[0]})}
                                          className="text-slate-500 text-xs file:bg-slate-800 file:border-none file:text-white file:px-4 file:py-2 file:rounded-lg file:mr-4 file:cursor-pointer hover:file:bg-slate-700" 
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 flex items-center justify-end space-x-4 mt-8 pt-8 border-t border-slate-800">
                                    <button 
                                      type="button" 
                                      onClick={resetForm}
                                      className="text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                      type="submit" 
                                      className="bg-orange-500 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                                    >
                                        {editingItem ? 'Sync Changes' : 'Confirm Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Manage Categories Modal */}
            <AnimatePresence>
                {isManageCategoriesOpen && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }} 
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-slate-900 border border-slate-800 p-12 rounded-[60px] w-full max-w-lg shadow-3xl"
                        >
                            <h2 className="text-4xl font-black text-white italic uppercase italic mb-8 tracking-tighter">Manage Categories</h2>
                            <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[8px] mb-8 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500">
                                CAUTION: DELETING A CATEGORY PERMANENTLY REMOVES ALL ASSOCIATED MENU ITEMS FROM THE DATABASE.
                            </p>

                            <form onSubmit={handleAddCategory} className="flex gap-3 mb-8">
                                <input 
                                    type="text" 
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    placeholder="Enter category name"
                                    className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-orange-500 uppercase"
                                />
                                <button 
                                    type="submit"
                                    className="bg-orange-500 text-white px-6 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                                >
                                    Add
                                </button>
                            </form>

                            <div className="space-y-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                                {categories.length === 0 ? (
                                    <p className="text-slate-600 font-bold text-center py-10">NO CATEGORIES FOUND</p>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl group">
                                            <span className="font-extrabold text-white text-xs uppercase tracking-widest italic">{cat}</span>
                                            <button 
                                                onClick={() => handleDeleteCategory(cat)}
                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button 
                                onClick={() => setIsManageCategoriesOpen(false)}
                                className="w-full mt-10 p-5 bg-slate-800 text-slate-400 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all"
                            >
                                Close Manager
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuManager;
