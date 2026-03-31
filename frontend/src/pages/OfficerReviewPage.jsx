import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimsService } from '../services/claims.service';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle, ArrowLeft, Building2, UserCircle, Activity, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfficerReviewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [claimData, setClaimData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Officer input state
    const [approvedAmount, setApprovedAmount] = useState('');
    const [officerNotes, setOfficerNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadClaim();
    }, [id]);

    const loadClaim = async () => {
        try {
            setLoading(true);
            const data = await claimsService.getClaimDetails(id);
            setClaimData(data);
            if (data?.claim?.status === 'pending_approval') {
                const recAmt = data.claim.ai_report?.policy_check?.recommended_amount || data.claim.claim_amount;
                setApprovedAmount(recAmt.toString());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setIsSubmitting('approve');
        try {
            await claimsService.approveClaim(id, {
                approved_amount: parseFloat(approvedAmount || 0),
                officer_notes: officerNotes || "Approved via SureCare Platform"
            });
            navigate('/officer');
        } catch (err) {
            console.error(err);
            alert("Failed to approve claim");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason && !officerNotes) {
            alert("Please provide a rejection reason or note.");
            return;
        }
        setIsSubmitting('reject');
        try {
            await claimsService.rejectClaim(id, {
                rejection_reason: rejectionReason || officerNotes,
                officer_notes: officerNotes
            });
            navigate('/officer');
        } catch (err) {
            console.error(err);
            alert("Failed to reject claim");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !claimData?.claim) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4" />
                <p className="text-slate-500 uppercase font-black text-xs tracking-widest">Loading Claim Data</p>
            </div>
        );
    }

    const { claim, documents } = claimData;
    const report = claim.ai_report;
    const isActionable = claim.status === 'pending_approval';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 -right-48 w-96 h-96 bg-cyan-500/20 rounded-full blur-[140px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
                    <Button variant="ghost" className="pl-0 text-slate-400 hover:text-white" onClick={() => navigate('/officer')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inbox
                    </Button>
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-sm uppercase tracking-widest text-slate-500 font-bold">Claim ID: {claim.id.split('-')[0]}</span>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-800 ${
                            claim.status === 'pending_approval' ? 'bg-cyan-500/10 text-cyan-400' :
                            claim.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                            STATUS: {claim.status.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Left Column - Financials & AI Verdict */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Financial Header */}
                        <div className="grid grid-cols-2 gap-px bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
                            <div className="bg-slate-900/90 p-8 flex flex-col justify-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Hospital Claim Amount</p>
                                <p className="text-4xl font-black text-white">₹{claim.claim_amount?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-slate-900/90 p-8 flex flex-col justify-center relative border-l border-slate-800">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Activity className="h-20 w-20 text-cyan-500" />
                                </div>
                                <p className="text-[10px] text-cyan-500 uppercase tracking-widest font-black mb-2 flex items-center gap-2">
                                    AI Recommendation <span className="bg-cyan-500/20 px-2 rounded-full py-0.5">{claim.ai_confidence_score}%</span>
                                </p>
                                <p className="text-4xl font-black text-cyan-400 italic">
                                    ₹{report?.policy_check?.recommended_amount?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>

                        {/* AI Executive Summary */}
                        <GlassCard className="p-8 border-cyan-500/20">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Activity className="h-4 w-4 text-cyan-400" /> Orchestrator Summary
                            </h3>
                            <div className="p-5 bg-slate-900/50 rounded-xl leading-relaxed text-slate-300 italic border border-slate-800">
                                "{report?.policy_check?.decision_summary || "AI Orchestrator approved claim parameters."}"
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Co-Pay Deduction</p>
                                    <p className="text-lg font-bold text-amber-400">₹{report?.policy_check?.copay_deduction?.toLocaleString() || 0}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Rule Engine Status</p>
                                    {report?.policy_check?.overall_eligible ? (
                                        <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-widest"><CheckCircle className="h-4 w-4" /> Eligible</p>
                                    ) : (
                                        <p className="text-sm font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-widest"><XCircle className="h-4 w-4" /> Non-Compliant</p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>

                        {/* Document Viewer list */}
                        <GlassCard className="p-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                                <FileText className="h-4 w-4 text-slate-400" /> Attached Evidence
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(documents || []).map((doc, idx) => (
                                    <a 
                                        key={idx} 
                                        href={doc.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-colors group"
                                    >
                                        <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                                            {doc.document_type === 'aadhar' ? <UserCircle className="h-5 w-5 text-indigo-400" /> : <FileText className="h-5 w-5 text-slate-400" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{doc.document_type.replace('_',' ')}</p>
                                            <p className="text-sm font-bold text-slate-200 truncate">{doc.file_name}</p>
                                        </div>
                                        <Download className="h-4 w-4 text-slate-600 group-hover:text-cyan-400" />
                                    </a>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column - Context & Actions */}
                    <div className="space-y-8">
                        <GlassCard className="p-6 border-slate-800">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">Patient Profile</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-200 font-bold text-lg">{claim.patient_name}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1 max-w-[200px] truncate">{claim.patient_id}</p>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                    <Building2 className="h-5 w-5 text-slate-400" />
                                    <p className="text-sm font-bold text-slate-300">{claim.hospital_name}</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Policy Matched</p>
                                    <p className="text-sm font-bold text-slate-300">{claim.policy_name}</p>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Action Panel */}
                        {isActionable ? (
                            <GlassCard className="p-6 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
                                
                                <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6">Execution Terminal</h3>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Final Approved Amount</label>
                                        <input 
                                            type="number" 
                                            value={approvedAmount}
                                            onChange={(e) => setApprovedAmount(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white font-bold text-lg outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Internal Notes / Rationale</label>
                                        <textarea 
                                            value={officerNotes}
                                            onChange={(e) => setOfficerNotes(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-slate-300 text-sm outline-none transition-colors h-24 resize-none"
                                            placeholder="Document your reasoning for compliance records..."
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-slate-800/50 flex flex-col gap-3">
                                        <Button 
                                            variant="neon" 
                                            className="w-full bg-emerald-500/20 text-emerald-400 border-emerald-500/50 py-4 font-black tracking-widest"
                                            onClick={handleApprove}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting === 'approve' ? 'Processing Transfer...' : 'APPROVE & DISBURSE'}
                                        </Button>
                                        
                                        <Button 
                                            variant="outline" 
                                            className="w-full bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 py-4 font-black tracking-widest"
                                            onClick={handleReject}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting === 'reject' ? 'Updating...' : 'REJECT CLAIM'}
                                        </Button>
                                    </div>
                                    <p className="text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest mt-2">
                                        Amount will be credited directly to hospital via DD logic
                                    </p>
                                </div>
                            </GlassCard>
                        ) : (
                            <GlassCard className="p-6 border-slate-800 text-center">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Final Ledger Status</h3>
                                <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 border ${claim.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                                    {claim.status === 'approved' ? <CheckCircle className="h-8 w-8 text-emerald-500" /> : <XCircle className="h-8 w-8 text-rose-500" />}
                                </div>
                                <h4 className={`text-xl font-black uppercase tracking-widest mb-2 ${claim.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {claim.status}
                                </h4>
                                {claim.status === 'approved' && claim.payment_reference && (
                                    <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Transfer Ledger Ref</p>
                                        <p className="font-mono text-cyan-400 text-sm">{claim.payment_reference}</p>
                                    </div>
                                )}
                            </GlassCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
