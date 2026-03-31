import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimsService } from '../services/claims.service';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Building2, Search, User, Shield, CreditCard, ArrowRight, Activity, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewClaimPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Data
    const [hospitals, setHospitals] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [policies, setPolicies] = useState([]);
    
    // Form state
    const [selectedHospital, setSelectedHospital] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [claimAmount, setClaimAmount] = useState('');
    
    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const hosp = await claimsService.getHospitals();
                const comps = await claimsService.getInsuranceCompanies();
                setHospitals(hosp);
                setCompanies(comps);
            } catch (err) {
                console.error("Failed to load initial data", err);
            }
        };
        loadInitialData();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery || !selectedHospital) return;
        
        setIsSearching(true);
        try {
            const results = await claimsService.searchPatients(selectedHospital, searchQuery);
            setSearchResults(results);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsSearching(false);
        }
    };

    const loadPolicies = async (companyName) => {
        setSelectedCompany(companyName);
        setSelectedPolicy(null);
        try {
            const pols = await claimsService.getPolicies(companyName);
            setPolicies(pols);
        } catch (err) {
            console.error("Failed to load policies", err);
        }
    };

    const handleCreateClaim = async () => {
        if (!selectedPatient || !selectedPolicy || !claimAmount) return;
        
        setIsSubmitting(true);
        try {
            const claim = await claimsService.createClaim({
                user_id: user.id,
                hospital_name: selectedHospital,
                patient_id: selectedPatient.patient_id,
                patient_name: selectedPatient.patient_name,
                insurance_company: selectedCompany,
                policy_code: selectedPolicy.policy_code,
                claim_amount: parseFloat(claimAmount)
            });
            
            // Navigate to step 2: Upload documents
            navigate(`/claim/${claim.id}/upload`);
        } catch (err) {
            console.error("Create claim failed", err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-4">INITIATE <span className="text-emerald-400">CLAIM</span></h1>
                    
                    {/* Stepper */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-slate-800'}`}>1</div>
                            <span className="font-bold uppercase text-[10px] tracking-widest hidden md:block">Identity</span>
                        </div>
                        <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-slate-800'}`}>2</div>
                            <span className="font-bold uppercase text-[10px] tracking-widest hidden md:block">Policy</span>
                        </div>
                        <div className={`h-1 w-12 rounded-full ${step >= 3 ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-slate-800'}`}>3</div>
                            <span className="font-bold uppercase text-[10px] tracking-widest hidden md:block">Confirm</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: HOSPITAL & PATIENT */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}>
                            <GlassCard className="p-8 border-emerald-500/30">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Building2 className="text-emerald-400" /> Select Hospital
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {hospitals.map(h => (
                                        <button 
                                            key={h.id}
                                            onClick={() => { setSelectedHospital(h.id); setSearchResults([]); }}
                                            className={`p-6 rounded-2xl text-left border-2 transition-all ${
                                                selectedHospital === h.id 
                                                ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                                                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                                            }`}
                                        >
                                            <h3 className="text-lg font-bold text-white">{h.name}</h3>
                                            <p className="text-slate-400 text-sm mt-1">SureCare integrated partner</p>
                                        </button>
                                    ))}
                                </div>

                                {selectedHospital && (
                                    <div className="mt-8 animate-in fade-in">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block">Link Patient Record</label>
                                        <form onSubmit={handleSearch} className="flex gap-3">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter exact patient name or ID..."
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/50 outline-none transition-colors"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <Button type="submit" variant="neon" disabled={isSearching} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/50">
                                                {isSearching ? <Activity className="animate-spin" /> : 'Search'}
                                            </Button>
                                        </form>

                                        {searchResults.length > 0 && (
                                            <div className="mt-6 space-y-3">
                                                {searchResults.map(p => (
                                                    <div 
                                                        key={p.patient_id} 
                                                        onClick={() => setSelectedPatient(p)}
                                                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all ${
                                                            selectedPatient?.patient_id === p.patient_id ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                                                <User className="h-5 w-5 text-slate-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold">{p.patient_name}</p>
                                                                <p className="text-xs text-slate-500 uppercase tracking-widest">{p.patient_id} • Dr. {p.attending_doctor}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-emerald-400 font-bold hidden sm:block">Total Bill: ₹{p.total_bill_amount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-10 flex justify-end">
                                    <Button 
                                        variant="neon" 
                                        className="gap-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                        onClick={() => setStep(2)}
                                        disabled={!selectedPatient}
                                    >
                                        Continue to Policy <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* STEP 2: POLICY */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                            <GlassCard className="p-8 border-emerald-500/30">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Shield className="text-emerald-400" /> Map Insurance Policy
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {companies.map(c => (
                                        <button 
                                            key={c.id}
                                            onClick={() => loadPolicies(c.id)}
                                            className={`p-6 rounded-2xl text-left border-2 transition-all ${
                                                selectedCompany === c.id 
                                                ? 'border-emerald-500 bg-emerald-500/10' 
                                                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                                            }`}
                                        >
                                            <h3 className="text-lg font-bold text-white">{c.name}</h3>
                                            <p className="text-slate-400 text-sm mt-1">SureCare Integrated</p>
                                        </button>
                                    ))}
                                </div>

                                {policies.length > 0 && (
                                    <div className="mt-8 animate-in fade-in">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block">Select Specific Policy</label>
                                        <div className="space-y-4">
                                            {policies.map(p => (
                                                <div 
                                                    key={p.policy_code}
                                                    onClick={() => setSelectedPolicy(p)}
                                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                                        selectedPolicy?.policy_code === p.policy_code ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-white font-bold text-lg">{p.policy_name}</h4>
                                                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{p.policy_code}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 mb-4">{p.coverage_type} Coverage • {p.copay_percentage}% Co-pay</p>
                                                    <div className="flex gap-2 text-xs flex-wrap">
                                                        {p.covered_treatments.slice(0,3).map(t => (
                                                            <span key={t} className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">✓ {t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-10 flex justify-between">
                                    <Button variant="ghost" className="text-slate-400" onClick={() => setStep(1)}>
                                        Back
                                    </Button>
                                    <Button 
                                        variant="neon" 
                                        className="gap-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                        onClick={() => {
                                            if (!claimAmount && selectedPatient) {
                                                setClaimAmount(selectedPatient.total_bill_amount.toString());
                                            }
                                            setStep(3);
                                        }}
                                        disabled={!selectedPolicy}
                                    >
                                        Review Setup <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* STEP 3: CONFIRM */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
                            <GlassCard className="p-8 border-emerald-500/30">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <FileText className="text-emerald-400" /> Review Claim Blueprint
                                </h2>

                                <div className="grid grid-cols-2 gap-px bg-slate-800 rounded-2xl overflow-hidden mb-8 border border-slate-800">
                                    <div className="bg-slate-900/80 p-6">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Patient Subject</p>
                                        <p className="text-lg font-bold text-white">{selectedPatient?.patient_name}</p>
                                        <p className="text-sm text-slate-400">{selectedPatient?.patient_id} @ {selectedHospital}</p>
                                    </div>
                                    <div className="bg-slate-900/80 p-6">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Target Policy</p>
                                        <p className="text-lg font-bold text-white">{selectedPolicy?.policy_name}</p>
                                        <p className="text-sm text-slate-400">{selectedCompany}</p>
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block">Final Claim Amount (₹)</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-emerald-400" />
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-xl py-5 pl-14 pr-4 text-3xl font-black text-white outline-none transition-colors shadow-inner"
                                            value={claimAmount}
                                            onChange={(e) => setClaimAmount(e.target.value)}
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 font-medium">This amount will be verified against uploaded hospital bills.</p>
                                </div>

                                <div className="mt-10 flex justify-between">
                                    <Button variant="ghost" className="text-slate-400" onClick={() => setStep(2)}>
                                        Back
                                    </Button>
                                    <Button 
                                        variant="neon" 
                                        className="gap-2 bg-emerald-500/20 text-emerald-400 py-6 px-10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                                        onClick={handleCreateClaim}
                                        disabled={isSubmitting || !claimAmount}
                                    >
                                        {isSubmitting ? <Activity className="animate-spin" /> : 'Lock Claim & Upload Docs'} <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
