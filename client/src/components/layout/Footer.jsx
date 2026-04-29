import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-[#070F2B] border-t border-[#535C91]/20 py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded bg-[#1B1A55]">
                            <img src="/logo.png" alt="CodeSync Logo" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">CodeSync</span>
                    </Link>
                    
                    <p className="text-sm text-gray-400 font-light">
                        © {new Date().getFullYear()} CodeSync. All rights reserved.
                    </p>
                    
                    <p className="flex items-center text-sm text-gray-400 font-light">
                        Engineered with <Heart size={14} className="mx-1 text-[#9290C3]" /> by Abhay
                    </p>
                </div>
            </div>
        </footer>
    );
}
