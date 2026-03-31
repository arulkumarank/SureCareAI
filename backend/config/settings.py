import os
from dotenv import load_dotenv

load_dotenv()

# ─── Supabase ────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# ─── Gemini API Keys (3 distinct agents) ─────────────────────
GEMINI_API_KEY_1 = os.getenv("GEMINI_API_KEY_1", "")  # Document Parser
GEMINI_API_KEY_2 = os.getenv("GEMINI_API_KEY_2", "")  # Verification
GEMINI_API_KEY_3 = os.getenv("GEMINI_API_KEY_3", "")  # Policy Checker

# ─── Officer emails (comma-separated) ────────────────────────
OFFICER_EMAILS = [
    e.strip().lower()
    for e in os.getenv("OFFICER_EMAILS", "officer@surecare.ai").split(",")
    if e.strip()
]

# ─── Hospital table mapping ──────────────────────────────────
HOSPITAL_TABLES = {
    "KG Hospital": "kg_hospital_patients",
    "Apollo Hospital": "apollo_hospital_patients",
}

# ─── Insurance policy table mapping ──────────────────────────
INSURANCE_TABLES = {
    "Star Health Insurance": "star_health_policies",
    "Bajaj Insurance": "bajaj_insurance_policies",
}

# ─── Upload config ───────────────────────────────────────────
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
