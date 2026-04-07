import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiDownload, FiLayout, FiMail, FiPhone, FiLock, FiUser, FiArrowRight, FiArrowLeft, FiActivity } from 'react-icons/fi';

const RegisterRestaurant = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [receiptUrl, setReceiptUrl] = useState(null);

    const [categories, setCategories] = useState([
        "Restaurant", "Cafe", "Hotel", "Bar", "Bakery", "Juice Bar", "Coffee Shop", "Fast Food", "Other"
    ]);

    const [formData, setFormData] = useState({
        licenseKey: '',
        restaurantName: '',
        category: 'Restaurant',
        email: '',
        phone: '',
        adminUsername: '',
        adminPassword: '',
        staffUsername: '',
        staffPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${apiBase}/saas/register`, formData);
            setSuccess('Registration Successful!');
            setReceiptUrl(res.data.downloadUrl);
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please check your license key and usernames.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">License Verification</h2>
                            <p className="text-gray-500">Enter your unique license key to begin</p>
                        </div>
                        <div className="relative">
                            <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                            <input 
                                name="licenseKey" 
                                placeholder="RESTO-XXXX-YYYY" 
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary outline-none transition-all uppercase"
                                onChange={handleChange}
                                value={formData.licenseKey}
                            />
                        </div>
                        <button 
                            onClick={nextStep}
                            disabled={!formData.licenseKey}
                            className="w-full py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group"
                        >
                            Verify & Continue <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Business Details</h2>
                            <p className="text-gray-500">Tell us about your establishment</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <FiLayout className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="restaurantName" placeholder="Restaurant Name" className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary outline-none" onChange={handleChange} value={formData.restaurantName} />
                            </div>
                            <div className="relative">
                                <select name="category" className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary outline-none appearance-none" onChange={handleChange} value={formData.category}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="email" type="email" placeholder="Business Email" className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary outline-none" onChange={handleChange} value={formData.email} />
                            </div>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="phone" placeholder="Phone Number" className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary outline-none" onChange={handleChange} value={formData.phone} />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={prevStep} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                <FiArrowLeft /> Back
                            </button>
                            <button onClick={nextStep} disabled={!formData.restaurantName || !formData.email} className="flex-[2] py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                                Next Step <FiArrowRight />
                            </button>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Account Security</h2>
                            <p className="text-gray-500">Create unique credentials for your portals</p>
                        </div>
                        
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                            <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-2">
                                <FiUser /> Admin Portal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input name="adminUsername" placeholder="Admin Username" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" onChange={handleChange} />
                                <input name="adminPassword" type="password" placeholder="Admin Password" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2 mb-2">
                                <FiActivity /> Kitchen / Staff Portal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input name="staffUsername" placeholder="Kitchen Username" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" onChange={handleChange} />
                                <input name="staffPassword" type="password" placeholder="Kitchen Password" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" onChange={handleChange} />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                        <div className="flex gap-4">
                            <button onClick={prevStep} disabled={loading} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                Back
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={loading}
                                className="flex-[2] py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Complete Registration'}
                                {!loading && <FiCheckCircle />}
                            </button>
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="text-center py-10 space-y-6"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-4">
                            <FiCheckCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Aboard!</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Your restaurant has been successfully registered. Please download your credentials receipt below.
                        </p>
                        
                        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                            <p className="text-sm text-gray-400 mb-4 uppercase tracking-widest font-bold">Registration Receipt</p>
                            <a 
                                href={import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${receiptUrl}` : `http://localhost:5000${receiptUrl}`}
                                download 
                                className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-md"
                            >
                                <FiDownload /> Download PDF Receipt
                            </a>
                        </div>

                        <div className="pt-6">
                            <button 
                                onClick={() => window.location.href = '/admin/login'}
                                className="text-primary font-bold hover:underline"
                            >
                                Go to Admin Login
                            </button>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Smart Dine <span className="text-primary">SaaS</span></h1>
                    <p className="text-gray-600">Empower your restaurant with the next generation of ordering system</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
                    {/* Progress Bar */}
                    {step < 4 && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
                            <motion.div 
                                className="h-full bg-primary"
                                initial={{ width: "33%" }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>

                <div className="text-center mt-12 text-gray-400 text-sm">
                    © 2026 Smart Dine Systems. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default RegisterRestaurant;
