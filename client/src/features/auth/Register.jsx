import React, { useState } from 'react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, FileText, Code } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        passwordHash: '',
        fullName: '',
        role: 'DEVELOPER', 
        provider: 'LOCAL',
        bio: ''
    });

    const navigate = useNavigate();
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Client-side validation to reduce server load
    const validate = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.username.length < 4 || formData.username.length > 20) {
            toast.error("Username must be between 4-20 characters");
            return false;
        }
        if (!emailRegex.test(formData.email)) {
            toast.error("Invalid email format");
            return false;
        }
        if (formData.passwordHash.length < 8) {
            toast.error("Password must be at least 8 characters");
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        const loadingToast = toast.loading('Creating your account...');
        try {
            const response = await api.post('/auth/register', formData);
            toast.success(`Welcome to CodeSync, ${response.data.username}!`, { id: loadingToast });
        } catch (error) {
            // Displays backend JSR-303 validation errors if they bypass frontend
            const errorMsg = error.response?.data?.message || 'Registration Failed';
            toast.error(errorMsg, { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen bg-codesync-dark flex items-center justify-center p-4">
            <Toaster position="top-right" />
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-codesync-deep p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-codesync-border"
            >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-codesync-accent mb-2">Join CodeSync</h2>
                    <p className="text-gray-400">Code Together. Build Faster. Ship Smarter.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="relative">
                        <FileText className="absolute left-3 top-3.5 text-codesync-border w-5 h-5" />
                        <input 
                            name="fullName" type="text" placeholder="Full Name" required
                            className="w-full pl-10 pr-4 py-3 bg-codesync-dark border border-codesync-border rounded-lg focus:ring-2 focus:ring-codesync-accent outline-none transition-all"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-codesync-border w-5 h-5" />
                            <input 
                                name="username" type="text" placeholder="Username" required
                                className="w-full pl-10 pr-4 py-3 bg-codesync-dark border border-codesync-border rounded-lg focus:ring-2 focus:ring-codesync-accent outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative">
                            <Code className="absolute left-3 top-3.5 text-codesync-border w-5 h-5" />
                            <select 
                                name="role"
                                className="w-full pl-10 pr-4 py-3 bg-codesync-dark border border-codesync-border rounded-lg focus:ring-2 focus:ring-codesync-accent outline-none appearance-none transition-all"
                                onChange={handleChange}
                            >
                                <option value="DEVELOPER">Developer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-codesync-border w-5 h-5" />
                        <input 
                            name="email" type="email" placeholder="Email Address" required
                            className="w-full pl-10 pr-4 py-3 bg-codesync-dark border border-codesync-border rounded-lg focus:ring-2 focus:ring-codesync-accent outline-none transition-all"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-codesync-border w-5 h-5" />
                        <input 
                            name="passwordHash" type="password" placeholder="Password" required
                            className="w-full pl-10 pr-4 py-3 bg-codesync-dark border border-codesync-border rounded-lg focus:ring-2 focus:ring-codesync-accent outline-none transition-all"
                            onChange={handleChange}
                        />
                    </div>

                    <textarea 
                        name="bio" placeholder="Tell us about yourself..." 
                        rows="3"
                        className="w-full p-3 bg-codesync-dark border border-codesync-border rounded-lg focus:ring-2 focus:ring-codesync-accent outline-none transition-all resize-none"
                        onChange={handleChange}
                    />

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full bg-codesync-accent hover:bg-opacity-90 text-codesync-dark font-bold py-4 rounded-lg text-lg transition-all shadow-lg shadow-codesync-accent/20"
                    >
                        Create Developer Account
                    </motion.button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-codesync-accent cursor-pointer hover:underline">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;