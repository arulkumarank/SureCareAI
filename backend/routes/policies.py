from fastapi import APIRouter, HTTPException
from config import supabase_config as db
from config.settings import INSURANCE_TABLES

router = APIRouter(prefix="/api/policies", tags=["Policies"])

@router.get("/")
def list_insurance_companies():
    """List all supported insurance companies."""
    return [{"id": k, "name": k} for k in INSURANCE_TABLES.keys()]

@router.get("/{company_name}")
def list_company_policies(company_name: str):
    """List all policies for a given insurance company."""
    table = INSURANCE_TABLES.get(company_name)
    if not table:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    
    policies = db.get_all_policies(table)
    return policies
