import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, LogOut, Clock, Activity, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export default function Navbar() {
    const { isAuthenticated, role, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Shield className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="font-bold text-xl tracking-tighter text-white">SURECARE <span className="text-emerald-400">AI</span></span>
                </Link>

                {isAuthenticated && role === 'user' && (
                    <div className="hidden md:flex items-center gap-2">
                        <NavLink 
                            to="/dashboard"
                            className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> My Claims</div>
                        </NavLink>
                    </div>
                )}

                {isAuthenticated && (role === 'insurance' || role === 'admin') && (
                    <div className="hidden md:flex items-center gap-2">
                        <NavLink 
                            to="/officer"
                            className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-2"><Activity className="h-4 w-4" /> Officer Dashboard</div>
                        </NavLink>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/50">
                                <div className={`h-2 w-2 rounded-full ${role === 'insurance' || role === 'admin' ? 'bg-cyan-400' : 'bg-emerald-400'} animate-pulse`} />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    {role === 'insurance' ? 'Officer' : role === 'admin' ? 'Admin' : 'Patient'} Mode
                                </span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </>
                    ) : (
                        <Button 
                            variant="neon" 
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/50"
                            onClick={() => navigate('/login')}
                        >
                            Sign In to Portal
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
}
