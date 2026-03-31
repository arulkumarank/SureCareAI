import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { claimsService } from '../services/claims.service';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { UploadCloud, File as FileIcon, Camera, X, Activity, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClaimUploadPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // File state
    const [billFile, setBillFile] = useState(null);
    const [reportFile, setReportFile] = useState(null);
    
    // Camera state for Aadhar
    const [showCamera, setShowCamera] = useState(false);
    const [aadharImage, setAadharImage] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'bill') setBillFile(e.target.files[0]);
            if (type === 'report') setReportFile(e.target.files[0]);
        }
    };

    // Camera Handlers
    const startCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied", err);
            setError("Could not access camera. Please ensure permissions are granted.");
            setShowCamera(false);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
            const file = new File([blob], "aadhar_capture.jpg", { type: "image/jpeg" });
            setAadharImage(file);
            stopCamera();
        }, 'image/jpeg', 0.8);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const handleUploadAndProcess = async () => {
        if (!billFile || !reportFile || !aadharImage) {
            setError("All three documents (Bill, Report, and Aadhar Photo) are required.");
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            // Upload sequentially (or Promise.all)
            await claimsService.uploadDocument(id, 'hospital_bill', billFile);
            await claimsService.uploadDocument(id, 'medical_report', reportFile);
            await claimsService.uploadDocument(id, 'aadhar', aadharImage);

            // Redirect to processing page which triggers the pipeline
            navigate(`/claim/${id}/processing`);
        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to securely upload documents. Please try again.");
            setIsUploading(false);
        }
    };

    const canSubmit = billFile && reportFile && aadharImage;

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-4">SECURE <span className="text-emerald-400">UPLOAD</span></h1>
                    <p className="text-slate-400 text-lg">Provide mandatory evidence to initiate AI orchestration.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Upload Hospital Bill */}
                    <GlassCard className="p-6 border-slate-800 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                            <UploadCloud className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Hospital Final Bill</h3>
                        <p className="text-xs text-slate-500 mb-6">Upload itemized bill (PDF/Image)</p>
                        
                        <div className="relative group w-full">
                            <input 
                                type="file" 
                                accept=".pdf,image/*" 
                                onChange={(e) => handleFileChange(e, 'bill')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 ${
                                billFile ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900/50 text-slate-400 group-hover:border-slate-600'
                            }`}>
                                {billFile ? (
                                    <><CheckCircle className="h-4 w-4" /> <span className="text-sm font-bold truncate max-w-[200px]">{billFile.name}</span></>
                                ) : (
                                    <><FileIcon className="h-4 w-4" /> <span className="text-sm font-bold">Select File</span></>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Upload Medical Report */}
                    <GlassCard className="p-6 border-slate-800 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                            <FileIcon className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Primary Medical Report</h3>
                        <p className="text-xs text-slate-500 mb-6">Discharge summary or diagnosis confirmation</p>
                        
                        <div className="relative group w-full">
                            <input 
                                type="file" 
                                accept=".pdf,image/*" 
                                onChange={(e) => handleFileChange(e, 'report')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 ${
                                reportFile ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900/50 text-slate-400 group-hover:border-slate-600'
                            }`}>
                                {reportFile ? (
                                    <><CheckCircle className="h-4 w-4" /> <span className="text-sm font-bold truncate max-w-[200px]">{reportFile.name}</span></>
                                ) : (
                                    <><FileIcon className="h-4 w-4" /> <span className="text-sm font-bold">Select File</span></>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Live Camera Aadhar Capture */}
                    <GlassCard className="p-8 border-slate-800 md:col-span-2 flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Identity Verification</h3>
                        <p className="text-sm text-slate-400 mb-8 max-w-md">For security and fraud prevention, we require a live photo capture of your Aadhar card or Govt ID.</p>
                        
                        <AnimatePresence mode="wait">
                            {showCamera ? (
                                <motion.div key="camera" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-auto">
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-black aspect-video mb-4">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                        
                                        {/* Camera guidelines overlay */}
                                        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                                            <div className="w-full h-full border-2 border-dashed border-emerald-500/50 rounded-lg"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" className="flex-1" onClick={stopCamera}>
                                            <X className="mr-2 h-4 w-4" /> Cancel
                                        </Button>
                                        <Button variant="neon" className="flex-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/50" onClick={capturePhoto}>
                                            <Camera className="mr-2 h-4 w-4" /> Capture ID
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mx-auto">
                                    {aadharImage ? (
                                        <div className="p-6 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 flex flex-col items-center">
                                            <CheckCircle className="h-10 w-10 text-emerald-400 mb-3" />
                                            <p className="text-white font-bold mb-4">ID Captured Successfully</p>
                                            <img src={URL.createObjectURL(aadharImage)} alt="ID Preview" className="h-24 object-cover rounded-lg border border-emerald-500/30 mb-4 opacity-50" />
                                            <Button variant="outline" size="sm" onClick={startCamera}>
                                                Retake Photo
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="neon" className="w-full py-8 text-lg bg-slate-900 border-slate-700 hover:border-emerald-500/50 group" onClick={startCamera}>
                                            <Camera className="mr-3 h-6 w-6 text-slate-400 group-hover:text-emerald-400 transition-colors" /> 
                                            Start Camera to Scan Aadhar
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <Button 
                        variant="neon" 
                        className={`gap-2 py-6 px-10 text-lg transition-all ${
                            canSubmit ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'opacity-50 cursor-not-allowed'
                        }`}
                        onClick={handleUploadAndProcess}
                        disabled={!canSubmit || isUploading}
                    >
                        {isUploading ? <Activity className="animate-spin mr-2" /> : null}
                        {isUploading ? 'Encrypting & Routing...' : 'Initiate AI Processing'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
