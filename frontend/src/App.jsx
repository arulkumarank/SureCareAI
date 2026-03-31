import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import NewClaimPage from './pages/NewClaimPage';
import ClaimUploadPage from './pages/ClaimUploadPage';
import ClaimProcessingPage from './pages/ClaimProcessingPage';
import ClaimResultPage from './pages/ClaimResultPage';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerReviewPage from './pages/OfficerReviewPage';

// Simple Route Guards
const ProtectedRoute = ({ children, requireRole }) => {
    const { isAuthenticated, role, loading } = useAuth();
    
    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6"><div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div></div>;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireRole && role !== requireRole && role !== 'admin') {
        // Redirect logic based on their actual role
        if (role === 'insurance' || role === 'admin') return <Navigate to="/officer" />;
        return <Navigate to="/dashboard" />;
    }

    return children;
};

// Root Redirector based on Role
const HomeRedirect = () => {
    const { isAuthenticated, role, loading } = useAuth();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" />;
    
    if (role === 'insurance' || role === 'admin') {
        return <Navigate to="/officer" />;
    }
    return <Navigate to="/dashboard" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
                    <Navbar />
                    <main className="pt-20">
                        <Routes>
                            <Route path="/" element={<HomeRedirect />} />
                            <Route path="/login" element={<LoginPage />} />
                            
                            {/* Patient Routes */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute requireRole="user"><PatientDashboard /></ProtectedRoute>
                            } />
                            <Route path="/claim/new" element={
                                <ProtectedRoute requireRole="user"><NewClaimPage /></ProtectedRoute>
                            } />
                            <Route path="/claim/:id/upload" element={
                                <ProtectedRoute requireRole="user"><ClaimUploadPage /></ProtectedRoute>
                            } />
                            <Route path="/claim/:id/processing" element={
                                <ProtectedRoute requireRole="user"><ClaimProcessingPage /></ProtectedRoute>
                            } />
                            <Route path="/claim/:id/result" element={
                                <ProtectedRoute requireRole="user"><ClaimResultPage /></ProtectedRoute>
                            } />

                            {/* Officer Routes */}
                            <Route path="/officer" element={
                                <ProtectedRoute requireRole="insurance"><OfficerDashboard /></ProtectedRoute>
                            } />
                            <Route path="/officer/claim/:id" element={
                                <ProtectedRoute requireRole="insurance"><OfficerReviewPage /></ProtectedRoute>
                            } />

                            {/* Catch All */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
