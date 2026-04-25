import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Shield, Zap, Cloud, Users, Loader2 } from 'lucide-react';

export default function Subscribe() {
    const [loading, setLoading] = useState(true);
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (!currentUser) {
            toast.error("Please login to subscribe");
            navigate('/login');
            return;
        }

        // Fetch current subscription status to populate the dashboard
        const fetchStatus = async () => {
            try {
                const userId = currentUser.userId || currentUser.id;
                const res = await api.get(`/payments/status/${userId}`);
                if (res.data.isSubscribed) {
                    setSubscriptionDetails(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch subscription details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [navigate]);

    // Step 1: Dynamically load Razorpay checkout script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async () => {
        if (!currentUser) return;

        setLoading(true);

        const res = await loadRazorpayScript();
        if (!res) {
            toast.error("Razorpay SDK failed to load. Please check your internet connection.");
            setLoading(false);
            return;
        }

        try {
            // Step 2: Create Order
            const { data: orderData } = await api.post('/payments/create-order', {
                amount: 499,
                userId: currentUser.userId || currentUser.id,
                email: currentUser.email
            });

            // Parse response if backend returns a string
            let parsedOrderData = orderData;
            if (typeof orderData === 'string') {
                try {
                    parsedOrderData = JSON.parse(orderData);
                } catch (e) {
                    throw new Error("Failed to parse order data");
                }
            }

            // Razorpay returns the ID in the 'id' field, not 'order_id'
            if (!parsedOrderData || !parsedOrderData.id) {
                throw new Error("Invalid order data received");
            }

            // Step 3: Razorpay Modal
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_...',
                amount: 49900, // 499 INR in paise
                currency: 'INR',
                name: 'CodeSync Pro',
                description: 'Monthly Subscription',
                order_id: parsedOrderData.id,
                handler: async function (response) {
                    setLoading(true);
                    try {
                        // Step 4: Signature Verification
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: currentUser.userId || currentUser.id
                        });

                        // 4. Post-Payment Handling - Success
                        toast.success("Payment Successful! Welcome to Pro.");
                        const updatedUser = { ...currentUser, isSubscribed: true };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        navigate('/dashboard');
                    } catch (err) {
                        console.error(err);
                        // Post-Payment Handling - Failure
                        toast.error("Verification failed. If money was deducted, please contact support.");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: currentUser.username || currentUser.name || "User",
                    email: currentUser.email || "",
                },
                theme: {
                    color: '#535C91'
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error("Payment initiation failed", err);
            toast.error("Failed to initiate payment. Please try again later.");
            setLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-[#070F2B] flex flex-col items-center pt-20 px-4 relative">
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-[#070F2B]/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-16 h-16 text-[#9290C3] animate-spin mb-4" />
                    <p className="text-xl font-bold text-white tracking-widest animate-pulse">PROCESSING SECURE PAYMENT</p>
                </div>
            )}

            <div className="text-center mb-12 mt-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                    {subscriptionDetails ? 'Your Subscription' : <React.Fragment>Unlock <span className="text-[#9290C3]">Pro Access</span></React.Fragment>}
                </h1>
                <p className="text-gray-400 max-w-lg mx-auto">
                    {subscriptionDetails 
                        ? 'Manage your CodeSync Pro membership and billing details.'
                        : 'Join thousands of elite developers using CodeSync to collaborate, run, and scale their ideas.'}
                </p>
            </div>

            {/* If Subscribed: Show Dashboard */}
            {subscriptionDetails ? (
                <div className="bg-[#1B1A55] border border-[#535C91]/50 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <div className="flex justify-between items-center mb-6 border-b border-[#535C91]/30 pb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Shield className="text-[#9290C3]" size={24} /> 
                                CodeSync Pro
                            </h2>
                            <p className="text-sm text-green-400 mt-1 font-bold flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Active
                            </p>
                        </div>
                        <span className="bg-[#535C91]/30 text-[#9290C3] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Monthly</span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="bg-[#070F2B]/40 p-4 rounded-lg border border-[#535C91]/20">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Purchase Date</p>
                            <p className="text-white font-medium">{new Date(subscriptionDetails.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="bg-[#070F2B]/40 p-4 rounded-lg border border-[#535C91]/20">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Next Billing / Expiry Date</p>
                            <p className="text-white font-medium">{new Date(subscriptionDetails.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="bg-[#070F2B]/40 p-4 rounded-lg border border-[#535C91]/20">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Amount Paid</p>
                            <p className="text-white font-medium">₹{subscriptionDetails.amount}</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-[#535C91]/20 text-[#9290C3] font-bold text-lg rounded-xl shadow-lg hover:bg-[#535C91]/40 transition-all border border-[#535C91]/50"
                    >
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                /* Else: Show Pricing Card */
                <div className="bg-[#1B1A55] border border-[#535C91]/50 rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all hover:scale-105 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="text-[#9290C3]" size={24} /> 
                            CodeSync Pro
                        </h2>
                        <span className="bg-[#535C91]/30 text-[#9290C3] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Monthly</span>
                    </div>
                    
                    <div className="mb-8">
                        <span className="text-5xl font-black text-white">₹499</span>
                        <span className="text-gray-400 font-medium"> / per month</span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <FeatureItem icon={<Users className="w-5 h-5 text-green-400" />} text="Real-time Collaboration" />
                        <FeatureItem icon={<Zap className="w-5 h-5 text-yellow-400" />} text="Unlimited AI Power" />
                        <FeatureItem icon={<Shield className="w-5 h-5 text-blue-400" />} text="Private Workspaces" />
                        <FeatureItem icon={<Cloud className="w-5 h-5 text-purple-400" />} text="Cloud Execution" />
                    </div>

                    <button 
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-[#535C91] to-[#9290C3] text-[#070F2B] font-black text-lg rounded-xl shadow-lg hover:shadow-[#9290C3]/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        Unlock Pro Access
                    </button>
                </div>
            )}
            
            {!subscriptionDetails && <p className="text-gray-500 text-sm mt-8 font-medium tracking-wide">SECURE PAYMENTS PROCESSED BY RAZORPAY</p>}
        </div>
    );
}

function FeatureItem({ icon, text }) {
    return (
        <div className="flex items-center gap-3 bg-[#070F2B]/40 p-3 rounded-lg border border-[#535C91]/20">
            <div className="p-1 rounded-md bg-[#1B1A55] border border-[#535C91]/50">{icon}</div>
            <span className="text-gray-200 font-medium">{text}</span>
        </div>
    );
}
