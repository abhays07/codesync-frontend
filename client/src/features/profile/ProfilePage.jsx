import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, GitBranch, Briefcase, Globe, FolderGit2, Calendar, MapPin, Mail, ExternalLink, ArrowLeft, Info, Shield, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getProfile } from '../../api/services/authService';
import { getOwnerProjects } from '../../api/services/projectService';
import { format } from 'date-fns';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();
    const [profile, setProfile] = useState(null);
    const [totalProjects, setTotalProjects] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    
    // Subscription States
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const [isSubLoading, setIsSubLoading] = useState(true);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const loggedInUserId = storedUser?.userId;
    const profileId = paramId ? parseInt(paramId, 10) : loggedInUserId;
    const isOwnProfile = loggedInUserId === profileId;

    useEffect(() => {
        if (location.state?.proRequired) {
            toast.error("Pro subscription required to access the dashboard.", {
                id: 'pro-required-toast',
                duration: 4000
            });
            // Clear the state so it doesn't show again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        if (!loggedInUserId) {
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            try {
                setIsLoading(true);
                const [profileData, projectsResponse] = await Promise.all([
                    getProfile(profileId),
                    getOwnerProjects(profileId)
                ]);
                
                setProfile(profileData);
                const projects = projectsResponse?.data || projectsResponse || [];
                setTotalProjects(Array.isArray(projects) ? projects.length : 0);
            } catch (err) {
                console.error("Error fetching profile details:", err);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchSubscriptionStatus = async () => {
            if (!isOwnProfile) {
                setIsSubLoading(false);
                return;
            }
            try {
                const res = await api.get(`/payments/status/${profileId}`);
                if (res.data.isSubscribed) {
                    setSubscriptionDetails(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch subscription details", err);
            } finally {
                setIsSubLoading(false);
            }
        };

        fetchProfileData();
        fetchSubscriptionStatus();
    }, [profileId, loggedInUserId, isOwnProfile, navigate]);

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
        setIsProcessingPayment(true);
        const res = await loadRazorpayScript();
        if (!res) {
            toast.error("Razorpay SDK failed to load.");
            setIsProcessingPayment(false);
            return;
        }

        try {
            const { data: orderData } = await api.post('/payments/create-order', {
                amount: 499,
                userId: loggedInUserId,
                email: storedUser?.email
            });

            let parsedOrderData = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_...',
                amount: 49900,
                currency: 'INR',
                name: 'CodeSync Pro',
                description: 'Monthly Subscription',
                order_id: parsedOrderData.id,
                handler: async function (response) {
                    setIsProcessingPayment(true);
                    try {
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: loggedInUserId
                        });
                        toast.success("Payment Successful! Welcome to Pro.");
                        const updatedUser = { ...storedUser, isSubscribed: true };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        window.location.reload();
                    } catch (err) {
                        toast.error("Verification failed.");
                    } finally {
                        setIsProcessingPayment(false);
                    }
                },
                prefill: {
                    name: profile?.fullName || profile?.username || "User",
                    email: storedUser?.email || "",
                },
                theme: { color: '#535C91' },
                modal: { ondismiss: () => setIsProcessingPayment(false) }
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            toast.error("Failed to initiate payment.");
            setIsProcessingPayment(false);
        }
    };

    if (isLoading || !profile) {
        return (
            <div className="min-h-screen bg-[#070F2B] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#9290C3] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#070F2B] p-6 sm:p-10 text-white selection:bg-[#9290C3]/30">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit">
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>
                    {isOwnProfile && (
                        <button onClick={() => navigate('/settings')} className="bg-[#535C91]/30 hover:bg-[#535C91]/50 text-white px-5 py-2 rounded-xl transition-colors font-medium w-full sm:w-auto text-center">
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1B1A55]/40 border border-[#535C91] rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center text-center"
                        >
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#9290C3]/50 mb-4 shadow-xl shadow-[#9290C3]/10">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#535C91] flex items-center justify-center text-4xl font-bold">
                                        {profile.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">{profile.fullName || profile.username}</h1>
                            <p className="text-[#9290C3] mb-4">@{profile.username}</p>
                            
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#535C91] to-transparent my-4" />
                            
                            <div className="flex flex-col gap-3 w-full text-left text-sm text-gray-300">
                                {isOwnProfile && (
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} className="text-[#9290C3]" />
                                        <span className="truncate">{profile.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-[#9290C3]" />
                                    <span>Joined {profile.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : 'Recently'}</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#1B1A55]/40 border border-[#535C91] rounded-3xl p-6 backdrop-blur-xl"
                        >
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ExternalLink size={18} className="text-[#9290C3]" />
                                Social Links
                            </h2>
                            <div className="space-y-4">
                                {profile.githubLink ? (
                                    <a href={profile.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group">
                                        <div className="w-10 h-10 rounded-full bg-[#535C91]/30 flex items-center justify-center group-hover:bg-[#535C91]/50 transition-colors">
                                            <GitBranch size={20} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden w-full">
                                            <span className="text-sm font-medium">GitHub</span>
                                            <span className="text-xs text-gray-500 truncate">{profile.githubLink.replace('https://', '')}</span>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-full bg-[#535C91]/10 flex items-center justify-center">
                                            <GitBranch size={20} />
                                        </div>
                                        <span className="text-sm">Not provided</span>
                                    </div>
                                )}

                                {profile.linkedinLink ? (
                                    <a href={profile.linkedinLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group">
                                        <div className="w-10 h-10 rounded-full bg-[#535C91]/30 flex items-center justify-center group-hover:bg-[#535C91]/50 transition-colors">
                                            <Briefcase size={20} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden w-full">
                                            <span className="text-sm font-medium">LinkedIn</span>
                                            <span className="text-xs text-gray-500 truncate">{profile.linkedinLink.replace('https://', '')}</span>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-full bg-[#535C91]/10 flex items-center justify-center">
                                            <Briefcase size={20} />
                                        </div>
                                        <span className="text-sm">Not provided</span>
                                    </div>
                                )}

                                {profile.twitterLink ? (
                                    <a href={profile.twitterLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group">
                                        <div className="w-10 h-10 rounded-full bg-[#535C91]/30 flex items-center justify-center group-hover:bg-[#535C91]/50 transition-colors">
                                            <Globe size={20} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden w-full">
                                            <span className="text-sm font-medium">Twitter / X</span>
                                            <span className="text-xs text-gray-500 truncate">{profile.twitterLink.replace('https://', '')}</span>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-full bg-[#535C91]/10 flex items-center justify-center">
                                            <Globe size={20} />
                                        </div>
                                        <span className="text-sm">Not provided</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Stats & Bio & Subscription */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gradient-to-br from-[#1B1A55] to-[#070F2B] border border-[#535C91] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#9290C3]/20 flex items-center justify-center mb-3">
                                    <FolderGit2 className="text-[#9290C3]" size={24} />
                                </div>
                                <h3 className="text-4xl font-bold text-white mb-1">{totalProjects}</h3>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Projects</p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-[#1B1A55] to-[#070F2B] border border-[#535C91] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#9290C3]/20 flex items-center justify-center mb-3">
                                    <User className="text-[#9290C3]" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{profile.role}</h3>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Account Type</p>
                            </motion.div>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#1B1A55]/40 border border-[#535C91] rounded-3xl p-8 backdrop-blur-xl"
                        >
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-[#535C91]/50 pb-4">
                                <User size={20} className="text-[#9290C3]" />
                                About Me
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                {profile.bio ? (
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg font-light">
                                        {profile.bio}
                                    </p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                                        <div className="w-16 h-16 rounded-full bg-[#535C91]/10 flex items-center justify-center mb-4">
                                            <Info size={32} />
                                        </div>
                                        <p>No bio provided yet.</p>
                                        {isOwnProfile && (
                                            <button 
                                                onClick={() => navigate('/settings')}
                                                className="text-[#9290C3] hover:text-white mt-2 font-medium"
                                            >
                                                Add a bio
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Subscription Section */}
                        {isOwnProfile && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-[#1B1A55]/40 border border-[#535C91] rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
                            >
                            {isProcessingPayment && (
                                <div className="absolute inset-0 bg-[#070F2B]/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm rounded-3xl">
                                    <Loader2 className="w-10 h-10 text-[#9290C3] animate-spin mb-2" />
                                    <p className="text-sm font-bold text-white tracking-widest animate-pulse">PROCESSING</p>
                                </div>
                            )}

                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-[#535C91]/50 pb-4">
                                <Shield size={20} className="text-[#9290C3]" />
                                CodeSync Pro Subscription
                            </h2>

                            {isSubLoading ? (
                                <div className="animate-pulse flex space-x-4">
                                    <div className="flex-1 space-y-4 py-1">
                                        <div className="h-4 bg-[#535C91]/50 rounded w-3/4"></div>
                                        <div className="h-4 bg-[#535C91]/50 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ) : subscriptionDetails ? (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white flex items-center">Pro Plan <span className="flex items-center gap-1 text-xs text-green-400 ml-3 bg-green-400/10 px-2 py-1 rounded-full"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div> Active</span></h3>
                                        </div>
                                        <span className="bg-[#535C91]/30 text-[#9290C3] text-xs font-bold px-3 py-1 rounded-full uppercase">Monthly</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-[#070F2B]/40 p-4 rounded-xl border border-[#535C91]/20">
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Purchase Date</p>
                                            <p className="text-white text-sm font-medium">{new Date(subscriptionDetails.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <div className="bg-[#070F2B]/40 p-4 rounded-xl border border-[#535C91]/20">
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Next Billing</p>
                                            <p className="text-white text-sm font-medium">{new Date(subscriptionDetails.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">Unlock Pro Access</h3>
                                        <p className="text-sm text-gray-400 max-w-sm">Get real-time collaboration, unlimited AI power, and private workspaces for ₹499/month.</p>
                                    </div>
                                    <button 
                                        onClick={handleSubscribe}
                                        disabled={isProcessingPayment}
                                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#535C91] to-[#9290C3] text-[#070F2B] font-bold rounded-xl hover:shadow-lg hover:shadow-[#9290C3]/20 transition-all whitespace-nowrap disabled:opacity-50"
                                    >
                                        Subscribe Now
                                    </button>
                                </div>
                            )}
                        </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
