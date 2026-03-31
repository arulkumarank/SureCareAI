import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsService } from '../services/claims.service';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { User, Activity, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OfficerDashboard() {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending_approval'); // pending_approval, all

    useEffect(() => {
        loadOfficerClaims();
    }, []);

    const loadOfficerClaims = async () => {
        try {
            setLoading(true);
            const data = await claimsService.getOfficerPendingClaims();
            setClaims(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredClaims = filter === 'all' ? claims : claims.filter(c => c.status === filter);

    return (
        <div className="min-h-screen bg-slate-950 p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.05)_0%,_transparent_50%)]" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">OFFICER <span className="text-cyan-400">COMMAND</span></h1>
                        <p className="text-slate-400 font-medium">Review and adjudicate AI-verified claims.</p>
                    </div>

                    <div className="flex gap-4">
                        <Button 
                            variant="outline" 
                            className={`px-6 rounded-xl ${filter === 'pending_approval' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : ''}`}
                            onClick={() => setFilter('pending_approval')}
                        >
                            Pending Review
                        </Button>
                        <Button 
                            variant="outline" 
                            className={`px-6 rounded-xl ${filter === 'all' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Claims
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500" />
                    </div>
                ) : filteredClaims.length === 0 ? (
                    <GlassCard className="text-center p-20 border-dashed border-slate-800">
                        <CheckCircle className="h-16 w-16 text-cyan-500/50 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Inbox Zero</h3>
                        <p className="text-slate-400">There are no claims awaiting your review right now.</p>
                    </GlassCard>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/30">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/50">
                                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest">Claim / Date</th>
                                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest">Patient Details</th>
                                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Requested</th>
                                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest text-center">AI Confidence</th>
                                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest text-center">Status</th>
                                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClaims.map((claim, idx) => (
                                    <motion.tr 
                                        key={claim.id} 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                                    >
                                        <td className="p-4">
                                            <p className="text-white font-mono text-sm tracking-wider font-bold">{claim.id.split('-')[0]}</p>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(claim.updated_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white font-bold">{claim.patient_name}</p>
                                            <p className="text-xs text-slate-400 mt-1">{claim.hospital_name} • {claim.policy_name || claim.policy_code}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <p className="text-lg font-black text-white">₹{claim.claim_amount?.toLocaleString()}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 shadow-inner">
                                                <span className={`text-sm font-black ${
                                                    claim.ai_confidence_score > 80 ? 'text-emerald-400' : 
                                                    claim.ai_confidence_score > 50 ? 'text-amber-400' : 'text-rose-400'
                                                }`}>
                                                    {claim.ai_confidence_score}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                                                claim.status === 'pending_approval' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                                claim.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                                {claim.status === 'pending_approval' ? 'Needs Review' : claim.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button 
                                                variant="outline" 
                                                className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm py-2 px-4 shadow-xl shadow-black/50"
                                                onClick={() => navigate(`/officer/claim/${claim.id}`)}
                                            >
                                                Inspect
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
