import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimsService } from '../services/claims.service';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle, ArrowLeft, ShieldCheck, Activity, Search, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClaimResultPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claimData, setClaimData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        loadClaim();
    }, [id]);

    const loadClaim = async () => {
        try {
            setLoading(true);
            const data = await claimsService.getClaimDetails(id);
            setClaimData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!claimData || !claimData.claim || !claimData.claim.ai_report) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
                <GlassCard className="p-8 text-center max-w-md border-rose-500/30">
                    <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Claim Processing Incomplete</h3>
                    <p className="text-slate-400 mb-6 text-sm">We couldn't retrieve the final AI report for this claim. It may still be processing or encountered an error.</p>
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                            Dashboard
                        </Button>
                        <Button variant="neon" className="flex-1 bg-emerald-500/10 text-emerald-400" onClick={loadClaim}>
                            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                        </Button>
                    </div>
                </GlassCard>
            </div>
        );
    }

    const { claim, ai_reports } = claimData;
    const report = claim.ai_report;
    const isApproved = claim.status === 'pending_approval' || claim.status === 'approved';
    const isFinished = claim.status === 'approved' || claim.status === 'rejected';

    const tabs = [
        { id: 'summary', label: 'AI Verdict Summary', icon: ShieldCheck },
        { id: 'verification', label: 'Identity & Hospital Checks', icon: Search },
        { id: 'policy', label: 'Policy Coverage Analysis', icon: Activity }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] opacity-20 ${isApproved ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <div className="absolute top-1/2 -left-24 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] opacity-10" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" className="pl-0 text-slate-400 hover:text-white transition-colors" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                    <span className="font-mono text-sm uppercase tracking-widest text-slate-500 font-bold border border-slate-800 px-4 py-1.5 rounded-full">
                        Claim ID: {claim.id.split('-')[0]}
                    </span>
                </div>

                {/* Main Identity & Verdict Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Central Verdict Card */}
                    <GlassCard className="lg:col-span-2 p-8 flex items-center gap-8 relative overflow-hidden">
                        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none transition-colors ${isApproved ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        
                        <div className={`h-28 w-28 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl border-2 ${
                            isApproved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                            'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                            {isApproved ? <CheckCircle className="h-14 w-14" /> : <XCircle className="h-14 w-14" />}
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Automated Assessment</h2>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                    claim.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                                    claim.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' :
                                    isApproved ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 
                                    'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                }`}>
                                    {claim.status.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <h1 className={`text-4xl md:text-5xl font-black italic tracking-tighter ${isApproved ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isFinished ? claim.status.toUpperCase() : (isApproved ? 'ELIGIBLE - PENDING OFFICER' : 'AUTO-REJECTED')}
                            </h1>
                            
                            <p className="mt-4 text-slate-300 max-w-lg leading-relaxed text-sm md:text-base">
                                {isFinished 
                                    ? `This claim was explicitly ${claim.status} by a SureCare Insurance Officer.` 
                                    : isApproved 
                                    ? "Standard integrated protocols satisfied. All clinical evidence, hospital records, and policy requirements have been verified by the orchestrator. Waiting for final clearance from an Insurance Officer." 
                                    : claim.rejection_reason || "Authorization cannot be granted at this time due to critical policy exceptions or insufficient clinical documentation."
                                }
                            </p>

                            {isFinished && claim.officer_notes && (
                                <div className="mt-4 p-4 rounded-xl relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-10 ${claim.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <p className="relative z-10 text-sm font-medium italic">
                                        <span className="font-bold uppercase text-[10px] tracking-widest block mb-1 opacity-70">Officer Notes:</span>
                                        "{claim.officer_notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Snapshot / Details Card */}
                    <GlassCard className="lg:col-span-1 p-6 flex flex-col justify-between border-slate-800">
                        <div>
                            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Requested Amount</p>
                                    <p className="text-3xl font-black text-white">₹{claim.claim_amount?.toLocaleString() || 0}</p>
                                </div>
                                
                                {claim.status === 'approved' && (
                                    <div className="text-right">
                                        <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-black mb-1">Approved Amount</p>
                                        <p className="text-2xl font-black text-emerald-400">₹{claim.approved_amount?.toLocaleString() || 0}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Patient Subject</p>
                                    <p className="text-slate-200 font-bold">{claim.patient_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Policy Matched</p>
                                    <p className="text-slate-200 font-bold">{claim.policy_name} ({claim.policy_code})</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Hospital Facility</p>
                                    <p className="text-slate-200 font-bold">{claim.hospital_name}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">AI Confidence</span>
                                <span className="text-sm font-bold text-cyan-400">{claim.ai_confidence_score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${claim.ai_confidence_score}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full rounded-full bg-cyan-400" 
                                />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Dashboard Tabs & Content */}
                <div className="flex gap-2 mb-6 p-1.5 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-w-max ${
                                activeTab === tab.id 
                                ? 'bg-slate-800 text-cyan-400 shadow-xl border border-slate-700' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'summary' && (
                            <GlassCard className="p-8">
                                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-cyan-400" /> Pipeline Decision Summary
                                </h3>
                                
                                <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 leading-relaxed text-slate-300 mb-8 italic">
                                    {report?.policy_check?.decision_summary || "No executive summary generated."}
                                </div>

                                {report?.rejection_reasons?.length > 0 && (
                                    <div className="mt-8 p-6 bg-rose-950/20 border border-rose-500/20 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertCircle className="h-5 w-5 text-rose-400" />
                                            <h4 className="text-sm font-black text-rose-400 uppercase tracking-widest">Identified Blocking Issues</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {report.rejection_reasons.map((reason, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-300">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </GlassCard>
                        )}

                        {activeTab === 'verification' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <GlassCard className="p-8">
                                    <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                        <ShieldCheck className="h-5 w-5 text-indigo-400" /> Identity Match Engine
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                                            <span className="text-slate-300 font-bold">Aadhar Card Verification</span>
                                            {report.verification?.identity_verified ? (
                                                <span className="text-emerald-400 flex items-center font-black bg-emerald-400/10 px-4 py-1.5 rounded-full text-xs border border-emerald-400/20"><CheckCircle className="h-4 w-4 mr-1.5" /> VERIFIED</span>
                                            ) : (
                                                <span className="text-rose-400 flex items-center font-black bg-rose-400/10 px-4 py-1.5 rounded-full text-xs border border-rose-400/20"><XCircle className="h-4 w-4 mr-1.5" /> FAILED</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 italic mt-2 px-2">{report.verification?.identity_details}</p>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-8">
                                    <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                        <Search className="h-5 w-5 text-indigo-400" /> Hospital Records Link
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                                            <span className="text-slate-300 font-bold">Bill Amount Sync</span>
                                            {report.verification?.bill_amount_verified ? (
                                                <span className="text-emerald-400 flex items-center font-black bg-emerald-400/10 px-4 py-1.5 rounded-full text-xs border border-emerald-400/20"><CheckCircle className="h-4 w-4 mr-1.5" /> MATCHED</span>
                                            ) : (
                                                <span className="text-rose-400 flex items-center font-black bg-rose-400/10 px-4 py-1.5 rounded-full text-xs border border-rose-400/20"><XCircle className="h-4 w-4 mr-1.5" /> MISMATCH</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                                            <span className="text-slate-300 font-bold">Diagnosis Consistency</span>
                                            {report.verification?.diagnosis_consistent ? (
                                                <span className="text-emerald-400 flex items-center font-black bg-emerald-400/10 px-4 py-1.5 rounded-full text-xs border border-emerald-400/20"><CheckCircle className="h-4 w-4 mr-1.5" /> CONSISTENT</span>
                                            ) : (
                                                <span className="text-rose-400 flex items-center font-black bg-rose-400/10 px-4 py-1.5 rounded-full text-xs border border-rose-400/20"><XCircle className="h-4 w-4 mr-1.5" /> GAP EXIST</span>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        )}

                        {activeTab === 'policy' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <GlassCard className="p-8">
                                    <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-400" /> Coverage Assessment
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                                            <span className="text-slate-300 font-bold">Treatment Covered by Policy</span>
                                            {report.policy_check?.policy_covers_treatment ? (
                                                <span className="text-emerald-400 flex items-center font-black bg-emerald-400/10 px-4 py-1.5 rounded-full text-xs border border-emerald-400/20"><CheckCircle className="h-4 w-4 mr-1.5" /> YES</span>
                                            ) : (
                                                <span className="text-rose-400 flex items-center font-black bg-rose-400/10 px-4 py-1.5 rounded-full text-xs border border-rose-400/20"><XCircle className="h-4 w-4 mr-1.5" /> EXCLUDED</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 italic mt-2 px-2">{report.policy_check?.coverage_details}</p>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-8">
                                    <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-400" /> Financial Limits
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                                            <span className="text-slate-300 font-bold">Within Coverage Limits</span>
                                            {report.policy_check?.within_coverage_limit ? (
                                                <span className="text-emerald-400 flex items-center font-black bg-emerald-400/10 px-4 py-1.5 rounded-full text-xs border border-emerald-400/20"><CheckCircle className="h-4 w-4 mr-1.5" /> VERIFIED</span>
                                            ) : (
                                                <span className="text-rose-400 flex items-center font-black bg-rose-400/10 px-4 py-1.5 rounded-full text-xs border border-rose-400/20"><AlertCircle className="h-4 w-4 mr-1.5" /> OVER LIMIT</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                                            <span className="text-slate-300 font-bold">Co-pay Deductions</span>
                                            <span className="text-amber-400 font-black">₹{report.policy_check?.copay_deduction?.toLocaleString() || 0}</span>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center">
                                        <span className="text-xs uppercase font-black text-slate-500 tracking-widest">Recommended Payout</span>
                                        <span className="text-2xl font-black text-white">₹{report.policy_check?.recommended_amount?.toLocaleString() || 0}</span>
                                    </div>
                                </GlassCard>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

const Spinner = () => (
    <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        <p className="text-slate-400 tracking-widest text-xs uppercase font-bold">Loading Data...</p>
    </div>
);
