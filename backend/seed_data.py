import sys
import os
import uuid
import datetime

# Setup path so importing config works
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from config import supabase_config as db

print("Checking environment variables...")
from config.settings import SUPABASE_URL, SUPABASE_SERVICE_KEY
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    print("This script uses the Service Role Key to bypass RLS and create seed data.")
    sys.exit(1)

print("\nSeeding KG Hospital Patients...")
kg_patients = [
    {
        "patient_id": "KG-2024-001", "patient_name": "Ramesh Kumar", "dob": "1980-05-15",
        "gender": "Male", "blood_group": "O+", "phone": "+91 9876543210", 
        "aadhar_number": "1234 5678 9012", "address": "Coimbatore, TN",
        "admission_date": "2024-03-25T10:00:00Z", "attending_doctor": "Dr. Senthil",
        "diagnosis": "Acute Appendicitis", "treatment": "Appendectomy", "total_bill_amount": 45000.00
    },
    {
        "patient_id": "KG-2024-002", "patient_name": "Priya Sharma", "dob": "1992-08-22",
        "gender": "Female", "blood_group": "B+", "phone": "+91 9876543211", 
        "aadhar_number": "2345 6789 0123", "address": "Tirupur, TN",
        "admission_date": "2024-03-28T14:30:00Z", "attending_doctor": "Dr. Anitha",
        "diagnosis": "Dengue Fever", "treatment": "IV Fluids, Monitor Platelets", "total_bill_amount": 15000.00
    }
]
try:
    for p in kg_patients:
        db.insert("kg_hospital_patients", p)
    print("✅ KG Hospital patients seeded")
except Exception as e:
    print(f"Error seeding KG Hospital: {e}")

print("\nSeeding Apollo Hospital Patients...")
apollo_patients = [
    {
        "patient_id": "APL-1001", "patient_name": "Arun Prakash", "dob": "1975-12-10",
        "gender": "Male", "blood_group": "A-", "phone": "+91 9876543212", 
        "aadhar_number": "3456 7890 1234", "address": "Chennai, TN",
        "admission_date": "2024-03-20T09:15:00Z", "discharge_date": "2024-03-24T18:00:00Z",
        "attending_doctor": "Dr. Reddy", "diagnosis": "Coronary Artery Disease", 
        "treatment": "Angioplasty", "total_bill_amount": 250000.00
    }
]
try:
    for p in apollo_patients:
        db.insert("apollo_hospital_patients", p)
    print("✅ Apollo Hospital patients seeded")
except Exception as e:
    print(f"Error seeding Apollo Hospital: {e}")

print("\nSeeding Star Health Policies...")
star_policies = [
    {
        "policy_name": "Star Comprehensive", "policy_code": "SH-COMP-001",
        "coverage_type": "Family Floater", "max_coverage_amount": 750000.00,
        "covered_treatments": ["Appendectomy", "Dengue Fever", "Angioplasty", "Fractures", "Maternity"],
        "excluded_treatments": ["Cosmetic Surgery", "Dental Treatment", "Weight Loss Surgery"],
        "waiting_period_days": 30, "copay_percentage": 10.00,
        "required_documents": ["Hospital Bill", "Discharge Summary", "Aadhar Card"],
        "pre_existing_clause": "Covered after 24 months of continuous renewal.",
        "terms_conditions": "The policy covers valid inpatient hospitalization expenses up to the sum insured. A 10% co-pay applies to all claims."
    }
]
try:
    for p in star_policies:
        db.insert("star_health_policies", p)
    print("✅ Star Health policies seeded")
except Exception as e:
    print(f"Error seeding Star Health: {e}")

print("\nSeeding Bajaj Insurance Policies...")
bajaj_policies = [
    {
        "policy_name": "Bajaj Health Guard", "policy_code": "BJ-HG-001",
        "coverage_type": "Individual", "max_coverage_amount": 500000.00,
        "covered_treatments": ["Appendectomy", "Fractures", "Cataract", "Dialysis"],
        "excluded_treatments": ["Dengue Fever", "Cosmetic Surgery", "Maternity"],
        "waiting_period_days": 15, "copay_percentage": 0.00,
        "required_documents": ["Hospital Bill", "Discharge Summary", "Aadhar Card"],
        "pre_existing_clause": "Covered after 36 months of continuous renewal.",
        "terms_conditions": "Policy covers inpatient hospitalization. Vector-borne diseases like Dengue are excluded under the basic plan."
    }
]
try:
    for p in bajaj_policies:
        db.insert("bajaj_insurance_policies", p)
    print("✅ Bajaj Insurance policies seeded")
except Exception as e:
    print(f"Error seeding Bajaj Insurance: {e}")

print("\nSeed Data Script Complete. Restart your backend server.")
