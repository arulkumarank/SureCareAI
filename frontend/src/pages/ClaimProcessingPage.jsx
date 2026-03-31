import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimsService } from '../services/claims.service';
import { GlassCard } from '../components/ui/GlassCard';
import { FileSearch, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClaimProcessingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const runPipeline = async () => {
            try {
                // Step 1: Document Parser Agent
                if (isMounted) setCurrentStep(1);
                
                // Start the actual backend process synchronously (for prototype)
                const processingPromise = claimsService.processClaim(id);

                // Simulate Agent 1
                await new Promise(r => setTimeout(r, 2000));
                
                // Step 2: Verification Agent
                if (isMounted) setCurrentStep(2);
                await new Promise(r => setTimeout(r, 2500));
                
                // Step 3: Policy Checker Agent
                if (isMounted) setCurrentStep(3);
                
                // Wait for the actual result
                const result = await processingPromise;
                
                if (result.error) {
                    throw new Error(result.error);
                }

                // Complete
                if (isMounted) setCurrentStep(4);
                await new Promise(r => setTimeout(r, 1000));

                if (isMounted) {
                    navigate(`/claim/${id}/result`);
                }
            } catch (err) {
                console.error("Pipeline failed", err);
                if (isMounted) {
                    setError("Processing failed: " + (err.message || 'Server error'));
                    setCurrentStep(0);
                }
            }
        };

        if (id) {
            runPipeline();
        }

        return () => {
            isMounted = false;
        };
    }, [id, navigate]);

    const agents = [
        { 
            id: 1, 
            name: "Document Parser Agent", 
            icon: FileSearch, 
            desc: "Extracting structured data from Aadhar, Bills, and Reports...", 
            color: "text-cyan-400", 
            bg: "bg-cyan-500/20",
            border: "border-cyan-500/60"
        },
        { 
            id: 2, 
            name: "Verification Agent", 
            icon: ShieldCheck, 
            desc: "Cross-checking extracted identity against integrated Hospital DB...", 
            color: "text-indigo-400", 
            bg: "bg-indigo-500/20",
            border: "border-indigo-500/60"
        },
        { 
            id: 3, 
            name: "Policy Checker Agent", 
            icon: Activity, 
            desc: "Evaluating medical necessity against Insurance company T&Cs...", 
            color: "text-purple-400", 
            bg: "bg-purple-500/20",
            border: "border-purple-500/60"
        }
    ];

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
                <GlassCard className="p-10 border-rose-500/30 text-center max-w-md">
                    <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
                        <Activity className="h-8 w-8 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4">Pipeline Interrupted</h2>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold tracking-widest uppercase text-sm"
                    >
                        Return to Dashboard
                    </button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 cyber-grid-animated opacity-10 pointer-events-none" />

            {/* Background glowing spheres based on active agent */}
            <div className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000 -z-10 opacity-20 ${
                currentStep === 1 ? 'bg-cyan-500' : 
                currentStep === 2 ? 'bg-indigo-500' : 
                currentStep === 3 ? 'bg-purple-500' : 
                'bg-emerald-500'
            }`} />

            <motion.div
                key="processing-view"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl mx-auto"
            >
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-4 flex items-center justify-center gap-4">
                        <div className="h-4 w-4 bg-emerald-500 rounded-full animate-pulse" />
                        ORCHESTRATOR ACTIVE
                    </h2>
                    <p className="text-slate-400 text-lg uppercase tracking-widest font-bold">Multi-Agent Swarm Orchestration</p>
                </div>

                <div className="space-y-6">
                    {agents.map((agent) => {
                        const isActive = currentStep === agent.id;
                        const isComplete = currentStep > agent.id;
                        const Icon = agent.icon;

                        return (
                            <GlassCard
                                key={agent.id}
                                className={`transition-all duration-700 p-6 flex flex-row items-center border-2 ${
                                    isActive ? `${agent.border} bg-slate-800/80 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-105` :
                                    isComplete ? 'border-emerald-500/30 bg-slate-900/60 opacity-80' :
                                    'border-slate-800/50 bg-slate-900/30 opacity-40 grayscale'
                                }`}
                            >
                                <div className="relative mr-8">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                                        isComplete ? 'bg-emerald-500/20' : isActive ? agent.bg : 'bg-slate-800'
                                    }`}>
                                        {isComplete ? (
                                            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                        ) : (
                                            <Icon className={`h-8 w-8 ${isActive ? agent.color : 'text-slate-500'} ${isActive && 'animate-pulse'}`} />
                                        )}
                                    </div>
                                    {isActive && (
                                        <div className={`absolute inset-0 h-16 w-16 rounded-2xl border-2 border-transparent border-t-${agent.color.replace('text-', '')} animate-spin`} />
                                    )}
                                </div>

                                <div className="flex-1 text-left">
                                    <h3 className={`text-xl font-bold transition-colors ${
                                        isComplete ? 'text-emerald-300' : isActive ? 'text-white' : 'text-slate-500'
                                    }`}>{agent.name}</h3>
                                    <p className={`text-sm mt-1 transition-colors ${
                                        isComplete ? 'text-emerald-400/70' : isActive ? 'text-slate-300' : 'text-slate-600'
                                    }`}>
                                        {isComplete ? 'Agent complete.' : isActive ? agent.desc : 'Waiting for handoff...'}
                                    </p>
                                </div>

                                {isActive && (
                                    <div className={`text-sm font-mono font-black animate-pulse ${agent.color}`}>
                                        [ EXECUTING ]
                                    </div>
                                )}
                            </GlassCard>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
