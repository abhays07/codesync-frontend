import { Code2, Home, LayoutDashboard, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';
import { getUserRole } from '../../utils/auth';

export default function StickyNavbar() {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (token) {
            setIsAdmin(getUserRole() === 'ADMIN');
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.clear();
        setIsMobileMenuOpen(false);
        navigate('/login');
    };

    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-40 border-b border-[#535C91]/60 bg-[#070F2B]/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <NavLink to="/" className="flex items-center gap-2" onClick={closeMenu}>
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#1B1A55]">
                        <img src="/logo.png" alt="CodeSync Logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold text-white">CodeSync</span>
                </NavLink>

                {/* Mobile Menu Button */}
                <div className="flex sm:hidden items-center gap-2">
                    {token && <NotificationCenter />}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className="p-2 text-[#9290C3] hover:text-white"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-4">
                    <NavLink to="/" className="text-sm text-gray-300 hover:text-white">Home</NavLink>
                    
                    {token ? (
                        <>
                            <NavLink to="/dashboard" className="text-sm text-gray-300 hover:text-white">Dashboard</NavLink>
                            {isAdmin && (
                                <NavLink to="/admin" className="text-sm font-bold text-red-400 hover:text-red-300">Admin</NavLink>
                            )}
                            <NavLink to="/profile" className="text-sm text-gray-300 hover:text-white">Profile</NavLink>
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

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="sm:hidden border-t border-[#535C91]/60 bg-[#070F2B]/95 backdrop-blur-xl absolute w-full pb-4 shadow-xl">
                    <div className="flex flex-col px-4 pt-2 pb-3 space-y-3">
                        <NavLink to="/" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-[#1B1A55] hover:text-white">Home</NavLink>
                        
                        {token ? (
                            <>
                                <NavLink to="/dashboard" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-[#1B1A55] hover:text-white">Dashboard</NavLink>
                                {isAdmin && (
                                    <NavLink to="/admin" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-bold text-red-400 hover:bg-[#1B1A55] hover:text-red-300">Admin Console</NavLink>
                                )}
                                <NavLink to="/profile" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-[#1B1A55] hover:text-white">Profile</NavLink>
                                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300">Logout</button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-[#1B1A55] hover:text-white">Login</NavLink>
                                <NavLink to="/register" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-[#9290C3] bg-[#1B1A55]">Join Now</NavLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}