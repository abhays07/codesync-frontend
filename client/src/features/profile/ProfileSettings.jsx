import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Trash2, Save, ArrowLeft, Camera, Info, AlertTriangle, GitBranch, Briefcase, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendOtp, resetPassword, deactivateAccount, updateProfile, getProfile } from '../../api/services/authService';

export default function ProfileSettings() {
    const navigate = useNavigate();
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    
    // OTP Password Reset State
    const [newPassword, setNewPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        fullName: '',
        username: '',
        avatarUrl: '',
        bio: '',
        githubLink: '',
        linkedinLink: '',
        twitterLink: ''
    });

    const storedUser = useMemo(() => JSON.parse(localStorage.getItem('user')), []);
    const userId = storedUser?.userId;
    const userEmail = storedUser?.email;

    useEffect(() => {
        if (userId) {
            getProfile(userId).then(data => {
                setProfile({
                    fullName: data.fullName || '',
                    username: data.username || '',
                    avatarUrl: data.avatarUrl || '',
                    bio: data.bio || '',
                    githubLink: data.githubLink || '',
                    linkedinLink: data.linkedinLink || '',
                    twitterLink: data.twitterLink || ''
                });
            }).catch(err => {
                console.error("Failed to fetch profile", err);
            });
        }
    }, [userId]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const loadingId = toast.loading("Saving profile...");
        try {
            await updateProfile(userId, profile);
            toast.success("Profile synchronized!", { id: loadingId });
            localStorage.setItem('user', JSON.stringify({ 
                ...storedUser, 
                username: profile.username,
                avatarUrl: profile.avatarUrl,
                fullName: profile.fullName
            }));
        } catch (err) {
            toast.error(err.message || "Failed to update profile.", { id: loadingId });
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) return toast.error("Min 8 characters required for new password");
        setIsSendingOtp(true);
        const loadingId = toast.loading("Sending OTP to your email...");
        try {
            await sendOtp(userEmail);
            toast.success("OTP sent! Please check your email.", { id: loadingId });
            setIsOtpSent(true);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to send OTP.", { id: loadingId });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!otp) return toast.error("Please enter the OTP");
        setIsResetting(true);
        const loadingId = toast.loading("Verifying and updating password...");
        try {
            await resetPassword(userEmail, otp, newPassword);
            toast.success("Password updated successfully!", { id: loadingId });
            setNewPassword('');
            setOtp('');
            setIsOtpSent(false);
        } catch (err) {
            toast.error(err.response?.data?.error || "Invalid OTP or failed to update.", { id: loadingId });
        } finally {
            setIsResetting(false);
        }
    };

    const confirmDeactivation = async () => {
        setIsDeactivating(true);
        try {
            await deactivateAccount(userId);
            toast.success("Account deactivated.");
            setShowDeactivateConfirm(false);
            localStorage.clear();
            navigate('/login');
        } catch (err) {
            toast.error("Deactivation failed.");
            setIsDeactivating(false);
        }
    };

    return (
        <>
            <main className="min-h-screen bg-[#070F2B] p-6 sm:p-10">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>

                    <h1 className="text-3xl font-bold text-white mb-10">Account Settings</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Personal Info Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <section className="bg-[#1B1A55]/40 border border-[#535C91] rounded-3xl p-8 backdrop-blur-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <User className="text-[#9290C3]" size={22} />
                                    <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                                </div>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                            <input 
                                                type="text"
                                                value={profile.fullName}
                                                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                                                className="w-full bg-[#070F2B] border border-[#535C91] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Username</label>
                                            <input 
                                                type="text"
                                                value={profile.username}
                                                onChange={(e) => setProfile({...profile, username: e.target.value})}
                                                className="w-full bg-[#070F2B] border border-[#535C91] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Avatar URL</label>
                                        <div className="relative">
                                            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input 
                                                type="text"
                                                placeholder="https://example.com/avatar.jpg"
                                                value={profile.avatarUrl}
                                                onChange={(e) => setProfile({...profile, avatarUrl: e.target.value})}
                                                className="w-full bg-[#070F2B] border border-[#535C91] rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Bio</label>
                                        <textarea 
                                            rows="3"
                                            value={profile.bio}
                                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                            className="w-full bg-[#070F2B] border border-[#535C91] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40 resize-none"
                                            placeholder="Tell us about your tech stack..."
                                        />
                                    </div>
                                    
                                    <div className="pt-4 border-t border-[#535C91]/50">
                                        <h3 className="text-white font-medium mb-4">Social Links</h3>
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input 
                                                    type="text"
                                                    placeholder="GitHub Profile URL"
                                                    value={profile.githubLink}
                                                    onChange={(e) => setProfile({...profile, githubLink: e.target.value})}
                                                    className="w-full bg-[#070F2B] border border-[#535C91] rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input 
                                                    type="text"
                                                    placeholder="LinkedIn Profile URL"
                                                    value={profile.linkedinLink}
                                                    onChange={(e) => setProfile({...profile, linkedinLink: e.target.value})}
                                                    className="w-full bg-[#070F2B] border border-[#535C91] rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input 
                                                    type="text"
                                                    placeholder="Twitter/X Profile URL"
                                                    value={profile.twitterLink}
                                                    onChange={(e) => setProfile({...profile, twitterLink: e.target.value})}
                                                    className="w-full bg-[#070F2B] border border-[#535C91] rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button 
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="bg-[#9290C3] text-[#070F2B] font-bold px-8 py-3 rounded-xl flex items-center gap-2 mt-4"
                                    >
                                        <Save size={18} /> Save Changes
                                    </motion.button>
                                </form>
                            </section>
                        </div>

                        {/* Sidebar: Security & Danger Zone */}
                        <div className="space-y-8">
                            {/* Change Password Section */}
                            <section className="bg-[#1B1A55]/40 border border-[#535C91] rounded-3xl p-6 backdrop-blur-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <Lock className="text-[#9290C3]" size={20} />
                                    <h2 className="text-lg font-semibold text-white">Security</h2>
                                </div>
                                
                                {!isOtpSent ? (
                                    <form onSubmit={handleSendOtp} className="space-y-4">
                                        <input 
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full bg-[#070F2B] border border-[#535C91] rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40 text-sm"
                                        />
                                        <p className="text-xs text-gray-400">An OTP will be sent to your registered email to confirm this change.</p>
                                        <button 
                                            type="submit"
                                            disabled={isSendingOtp}
                                            className="w-full bg-[#535C91] hover:bg-[#535C91]/80 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
                                        >
                                            {isSendingOtp ? "Sending..." : "Send OTP"}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handlePasswordReset} className="space-y-4">
                                        <div className="bg-[#070F2B]/50 p-3 rounded-xl border border-[#9290C3]/30 mb-2">
                                            <p className="text-xs text-[#9290C3]">Email sent to {userEmail}</p>
                                        </div>
                                        <input 
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter 6-digit OTP"
                                            className="w-full bg-[#070F2B] border border-[#535C91] rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40 text-sm tracking-widest text-center"
                                            maxLength={6}
                                        />
                                        <button 
                                            type="submit"
                                            disabled={isResetting}
                                            className="w-full bg-[#9290C3] text-[#070F2B] hover:bg-white font-bold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
                                        >
                                            {isResetting ? "Verifying..." : "Verify & Change Password"}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setIsOtpSent(false)}
                                            className="w-full text-xs text-gray-400 hover:text-white mt-2"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                )}
                            </section>

                            {/* Danger Zone */}
                            <section className="bg-red-900/20 border border-red-500/40 rounded-3xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Trash2 className="text-red-400" size={20} />
                                    <h2 className="text-lg font-semibold text-red-300">Danger Zone</h2>
                                </div>
                                <p className="text-sm text-red-300/70 mb-4">
                                    Deactivating your account is a permanent action.
                                </p>
                                <motion.button 
                                    onClick={() => setShowDeactivateConfirm(true)}
                                    disabled={isDeactivating}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className="w-full bg-red-600/80 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeactivating ? "Deactivating..." : "Deactivate Account"}
                                </motion.button>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {showDeactivateConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDeactivateConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md rounded-2xl border border-red-500/50 bg-[#1B1A55] p-8 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/10 text-red-500">
                                    <AlertTriangle size={32} />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold text-white">Confirm Deactivation</h2>
                                <p className="mb-6 text-gray-300">
                                    This will permanently disable your CodeSync account and log you out. Are you sure you want to proceed?
                                </p>
                                <div className="flex w-full gap-4">
                                    <button
                                        onClick={() => setShowDeactivateConfirm(false)}
                                        className="flex-1 rounded-xl bg-[#535C91]/50 py-3 font-semibold text-white transition-colors hover:bg-[#535C91]/80"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeactivation}
                                        className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                                    >
                                        Deactivate
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}