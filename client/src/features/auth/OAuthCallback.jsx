import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../api/services/authService';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const finalizeLogin = async () => {
            const params = new URLSearchParams(window.location.search);
            const tokenFromUrl = params.get('token');

            if (tokenFromUrl) {
                localStorage.setItem('token', tokenFromUrl);
            }

            try {
                // Now getMe() will use the token we just saved
                const data = await getMe();
                localStorage.setItem('user', JSON.stringify({ 
                    userId: data.userId, 
                    username: data.username,
                    email: data.email,
                    avatarUrl: data.avatarUrl
                }));
                toast.success(`Welcome back, ${data.username}!`);
                navigate('/dashboard');
            } catch (err) {
                console.error("OAuth Finalize Error:", err);
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