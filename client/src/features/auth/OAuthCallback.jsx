import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../api/services/authService';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const finalizeLogin = async () => {
            try {
                const data = await getMe();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ 
                    userId: data.userId, 
                    username: data.username 
                }));
                toast.success("Welcome back via Google!");
                navigate('/dashboard');
            } catch (err) {
                toast.error("Social login handshake failed.");
                navigate('/login');
            }
        };
        finalizeLogin();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#070F2B] flex items-center justify-center">
            <div className="text-[#9290C3] animate-pulse font-bold">Syncing Profile...</div>
        </div>
    );
}