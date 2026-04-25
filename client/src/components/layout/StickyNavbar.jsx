import { Code2, Home, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/login', label: 'Login', icon: LogIn },
  { to: '/register', label: 'Register', icon: UserPlus },
];

import NotificationCenter from './NotificationCenter';

export default function StickyNavbar() {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 border-b border-[#535C91]/60 bg-[#070F2B]/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <NavLink to="/" className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#1B1A55] p-2">
                        <Code2 className="h-5 w-5 text-[#9290C3]" />
                    </div>
                    <span className="font-bold text-white">CodeSync</span>
                </NavLink>

                <div className="flex items-center gap-2 sm:gap-4">
                    <NavLink to="/" className="text-sm text-gray-300 hover:text-white">Home</NavLink>
                    
                    {token ? (
                        <>
                            <NavLink to="/dashboard" className="text-sm text-gray-300 hover:text-white">Dashboard</NavLink>
                            <NotificationCenter />
                            <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-300">Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="text-sm text-gray-300 hover:text-white">Login</NavLink>
                            <NavLink to="/register" className="rounded-md bg-[#9290C3] px-3 py-1.5 text-xs font-bold text-[#070F2B]">Join</NavLink>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}