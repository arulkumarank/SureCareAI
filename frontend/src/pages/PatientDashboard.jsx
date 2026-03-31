import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { claimsService } from '../services/claims.service';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PatientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadClaims();
    }, [user]);

    const loadClaims = async () => {
        try {
            setLoading(true);
            const data = await claimsService.getUserClaims(user.id);
            setClaims(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const statuses = {
            draft: { c: 'bg-slate-500/10 text-slate-400 border-slate-500/20', i: Clock },
            documents_pending: { c: 'bg-amber-500/10 text-amber-400 border-amber-500/20', i: AlertCircle },
            processing: { c: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', i: Activity },
            verification_failed: { c: 'bg-rose-500/10 text-rose-400 border-rose-500/20', i: XCircle },
            pending_approval: { c: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', i: Clock },
            approved: { c: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', i: CheckCircle },
            rejected: { c: 'bg-rose-500/10 text-rose-400 border-rose-500/20', i: XCircle },
        };
        const st = statuses[status] || statuses.draft;
        const Icon = st.i;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border flex items-center gap-1.5 w-max ${st.c}`}>
                <Icon className="h-3.5 w-3.5" />
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 sm:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">MY <span className="text-emerald-400">CLAIMS</span></h1>
                        <p className="text-slate-400 font-medium">Track your insurance claims and upload documents.</p>
                    </div>

                    <Button 
                        variant="neon" 
                        className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/50"
                        onClick={() => navigate('/claim/new')}
                    >
                        <PlusCircle className="mr-2 h-5 w-5" /> Start New Claim
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" />
                    </div>
                ) : claims.length === 0 ? (
                    <GlassCard className="text-center p-20 border-dashed border-slate-800">
                        <FileText className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">No claims found</h3>
                        <p className="text-slate-400 mb-6">You haven't submitted any insurance claims yet.</p>
                        <Button variant="outline" onClick={() => navigate('/claim/new')}>
                            Start your first claim
                        </Button>
                    </GlassCard>
                ) : (
                    <div className="grid gap-4">
                        {claims.map((claim, idx) => (
                            <motion.div key={claim.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                <GlassCard 
                                    className="p-6 cursor-pointer hover:border-emerald-500/30 transition-all group"
                                    onClick={() => navigate(`/claim/${claim.id}/result`)}
                                >
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">
                                                    ₹{claim.claim_amount?.toLocaleString('en-IN') || 0}
                                                </h3>
                                                <StatusBadge status={claim.status} />
                                            </div>
                                            <div className="text-sm text-slate-400 flex flex-wrap gap-x-6 gap-y-2">
                                                <span><strong className="text-slate-300">Policy:</strong> {claim.policy_name || claim.policy_code}</span>
                                                <span><strong className="text-slate-300">Hospital:</strong> {claim.hospital_name}</span>
                                                <span><strong className="text-slate-300">Patient:</strong> {claim.patient_name}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between md:justify-end gap-6 text-right w-full md:w-auto">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Submitted At</p>
                                                <p className="text-slate-300">{new Date(claim.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <ChevronRight className="h-6 w-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
