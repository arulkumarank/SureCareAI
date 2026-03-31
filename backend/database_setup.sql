-- ============================================================
-- SureCare AI — Supabase Database Setup
-- Run this in your Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── KG Hospital Patients ───────────────────────────────────
CREATE TABLE IF NOT EXISTS kg_hospital_patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    blood_group TEXT,
    phone TEXT,
    aadhar_number TEXT,
    address TEXT,
    admission_date TIMESTAMPTZ,
    discharge_date TIMESTAMPTZ,
    attending_doctor TEXT,
    diagnosis TEXT,
    treatment TEXT,
    total_bill_amount NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Apollo Hospital Patients ───────────────────────────────
CREATE TABLE IF NOT EXISTS apollo_hospital_patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    blood_group TEXT,
    phone TEXT,
    aadhar_number TEXT,
    address TEXT,
    admission_date TIMESTAMPTZ,
    discharge_date TIMESTAMPTZ,
    attending_doctor TEXT,
    diagnosis TEXT,
    treatment TEXT,
    total_bill_amount NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Star Health Insurance Policies ─────────────────────────
CREATE TABLE IF NOT EXISTS star_health_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    policy_name TEXT NOT NULL,
    policy_code TEXT UNIQUE NOT NULL,
    coverage_type TEXT,
    max_coverage_amount NUMERIC(12,2),
    covered_treatments TEXT[],
    excluded_treatments TEXT[],
    waiting_period_days INT DEFAULT 0,
    copay_percentage NUMERIC(5,2) DEFAULT 0,
    required_documents TEXT[],
    terms_conditions TEXT,
    pre_existing_clause TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Bajaj Insurance Policies ───────────────────────────────
CREATE TABLE IF NOT EXISTS bajaj_insurance_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    policy_name TEXT NOT NULL,
    policy_code TEXT UNIQUE NOT NULL,
    coverage_type TEXT,
    max_coverage_amount NUMERIC(12,2),
    covered_treatments TEXT[],
    excluded_treatments TEXT[],
    waiting_period_days INT DEFAULT 0,
    copay_percentage NUMERIC(5,2) DEFAULT 0,
    required_documents TEXT[],
    terms_conditions TEXT,
    pre_existing_clause TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SureCare AI: Claims ────────────────────────────────────
CREATE TABLE IF NOT EXISTS claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    hospital_name TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_details JSONB,
    insurance_company TEXT NOT NULL,
    policy_code TEXT NOT NULL,
    policy_name TEXT,
    claim_amount NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'draft',
    ai_confidence_score NUMERIC(5,2),
    ai_report JSONB,
    officer_notes TEXT,
    rejection_reason TEXT,
    approved_amount NUMERIC(12,2),
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SureCare AI: Claim Documents ───────────────────────────
CREATE TABLE IF NOT EXISTS claim_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT,
    parsed_data JSONB,
    parsing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SureCare AI: AI Reports ────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    agent_input JSONB,
    agent_output JSONB,
    confidence NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Enable RLS but allow service role full access ──────────
ALTER TABLE kg_hospital_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE apollo_hospital_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_health_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bajaj_insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

-- Allow anon/authenticated to read hospital & policy data
CREATE POLICY "Public read hospital patients" ON kg_hospital_patients FOR SELECT USING (true);
CREATE POLICY "Public read apollo patients" ON apollo_hospital_patients FOR SELECT USING (true);
CREATE POLICY "Public read star policies" ON star_health_policies FOR SELECT USING (true);
CREATE POLICY "Public read bajaj policies" ON bajaj_insurance_policies FOR SELECT USING (true);

-- Claims: users can read their own, officers can read all
CREATE POLICY "Users read own claims" ON claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own claims" ON claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access claims" ON claims USING (true) WITH CHECK (true);

CREATE POLICY "Users read own docs" ON claim_documents FOR SELECT USING (
    claim_id IN (SELECT id FROM claims WHERE user_id = auth.uid())
);
CREATE POLICY "Service role full access docs" ON claim_documents USING (true) WITH CHECK (true);

CREATE POLICY "Users read own reports" ON ai_reports FOR SELECT USING (
    claim_id IN (SELECT id FROM claims WHERE user_id = auth.uid())
);
CREATE POLICY "Service role full access reports" ON ai_reports USING (true) WITH CHECK (true);

-- Create storage bucket for claim documents
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-documents', 'claim-documents', true)
ON CONFLICT (id) DO NOTHING;
