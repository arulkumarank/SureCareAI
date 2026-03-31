import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';

export default function LoginPage() {
    const { loginWithGoogle, loginWithEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogle();
            // Google OAuth naturally redirects the browser, but just in case
        } catch (err) {
            setError('Failed to sign in with Google: ' + err.message);
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loginWithEmail(email, password);
            navigate('/'); // Navigate to home redirector which checks roles
        } catch (err) {
            setError('Failed to sign in: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
            <div className="absolute inset-0 cyber-grid-animated opacity-20" />

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30">
                            <ShieldCheck className="h-8 w-8 text-emerald-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SURECARE <span className="text-emerald-400">AI</span></h1>
                    <p className="text-slate-400 font-medium">Enterprise Claims Processing Portal</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    <GlassCard variant="cyber" className="p-10 border-emerald-500/30 bg-slate-900/40 backdrop-blur-xl">
                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-slate-400 text-sm">Sign in to access your dashboard.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="Enter your password"
                                />
                            </div>
                            <Button 
                                type="submit"
                                variant="neon" 
                                className="w-full py-4 text-emerald-950 font-bold bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] mt-2"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In with Email'}
                            </Button>
                        </form>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/50"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-900/40 text-slate-400 backdrop-blur-xl">Or continue with</span>
                            </div>
                        </div>

                        <Button 
                            type="button"
                            variant="glass" 
                            className="w-full flex items-center justify-center gap-3 py-4 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </Button>

                        <div className="mt-8 pt-8 border-t border-slate-800 text-center flex flex-col gap-2">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Verify identity before proceeding</p>
                            <p className="text-xs text-slate-600">Offices: Use your @surecare.ai email.</p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
}
