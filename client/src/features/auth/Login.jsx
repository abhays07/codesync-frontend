import React, { useState } from 'react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Authenticating...');
        try {
            // Requirement: JWT login through Gateway 
            const response = await api.post('/auth/login', {
                username: credentials.username,
                password: credentials.password // Backend expects 'password' for login logic
            });
            
            // Store token for session management 
            localStorage.setItem('token', response.data);
            toast.success('Access Granted. Welcome back!', { id: loadingToast });
            
            // Redirect to Dashboard 
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid Credentials', { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen bg-codesync-dark flex items-center justify-center p-4">
            <Toaster position="top-right" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-codesync-deep p-8 rounded-2xl shadow-2xl w-full max-w-md border border-codesync-border"
            >
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-codesync-accent mb-2">CodeSync Login</h2>
                    <p className="text-gray-400">Secure access to your workspace</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-codesync-border w-5 h-5" />
                        <input 
                            type="text" placeholder="Username" required
                            className="w-full pl-10 pr-4 py-3 bg-codesync-dark border border-codesync-border rounded-lg focus:ring-2 focus:ring-codesync-accent outline-none"
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-codesync-border w-5 h-5" />
                        <input 
                            type="password" placeholder="Password" required
                            className="w-full pl-10 pr-4 py-3 bg-codesync-dark border border-codesync-border rounded-lg focus:ring-2 focus:ring-codesync-accent outline-none"
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                    </div>

                    <motion.button 
                        whileHover={{ x: 5 }}
                        type="submit" 
                        className="w-full bg-codesync-accent text-codesync-dark font-bold py-4 rounded-lg flex items-center justify-center gap-2"
                    >
                        Sign In <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </form>

                <div className="mt-8 flex justify-between text-sm text-gray-500">
                    <span className="hover:text-codesync-accent cursor-pointer">Forgot Password?</span>
                    <Link to="/register" className="text-codesync-accent cursor-pointer hover:underline">New here? Register</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;