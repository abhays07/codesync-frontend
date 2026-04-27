import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { Loader2 } from 'lucide-react';

const SubscriptionGuard = ({ children }) => {
    const [isSubscribed, setIsSubscribed] = useState(null); // null = loading
    const location = useLocation();

    useEffect(() => {
        const verifySubscription = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setIsSubscribed(false);
                return;
            }
            
            const user = JSON.parse(userStr);
            
            try {
                // Call the backend to verify the latest payment status for the logged-in user
                const userId = user.userId || user.id;
                // Assuming /payments/status/{userId} on the backend API gateway
                const res = await api.get(`/payments/status/${userId}`);
                const subscribed = res.data.isSubscribed || res.data.active || res.data === true; 
                setIsSubscribed(!!subscribed);
                
                // Update persistent Auth State
                localStorage.setItem('user', JSON.stringify({ ...user, isSubscribed: !!subscribed }));
            } catch (err) {
                console.error("Failed to verify subscription status. Assuming unsubscribed or using cached.", err);
                setIsSubscribed(user.isSubscribed || false);
            }
        };

        verifySubscription();
    }, []);

    if (isSubscribed === null) {
        return (
            <div className="h-screen w-full bg-[#070F2B] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#9290C3] animate-spin mb-4" />
                <p className="text-[#9290C3] font-semibold tracking-widest animate-pulse">VERIFYING SUBSCRIPTION...</p>
            </div>
        );
    }

    if (!isSubscribed) {
        // Redirect to profile if isSubscribed is false
        return <Navigate to="/profile" state={{ proRequired: true, from: location }} replace />;
    }

    return children;
};

export default SubscriptionGuard;
