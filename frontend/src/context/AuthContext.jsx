import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

const ADMIN_EMAILS = ['admin@surecare.ai'];
const INSURANCE_EMAILS = ['insurance@surecare.ai', 'officer@surecare.ai'];
const HOSPITAL_EMAILS = ['hospital@surecare.ai', 'doctor@surecare.ai'];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Roles
    const [role, setRole] = useState('user'); // default is user (patient)

    const determineRole = (email) => {
        if (!email) return 'user';
        const e = email.toLowerCase();
        if (ADMIN_EMAILS.includes(e)) return 'admin';
        if (INSURANCE_EMAILS.includes(e)) return 'insurance';
        if (HOSPITAL_EMAILS.includes(e)) return 'hospital';
        return 'user';
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setRole(determineRole(currentUser?.email));
            setLoading(false);
        });

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setRole(determineRole(currentUser?.email));
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google'
        });
        if (error) throw error;
    };

    const loginWithEmail = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, role, loading, loginWithGoogle, loginWithEmail, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
