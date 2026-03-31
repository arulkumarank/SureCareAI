from fastapi import APIRouter, HTTPException, Query
from config import supabase_config as db
from config.settings import HOSPITAL_TABLES

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])

@router.get("/")
def list_hospitals():
    """List all available hospitals."""
    return [{"id": k, "name": k} for k in HOSPITAL_TABLES.keys()]

@router.get("/{hospital_name}/patients")
def search_hospital_patients(hospital_name: str, q: str = Query(..., min_length=2)):
    """Search for a patient in a specific hospital's database."""
    table = HOSPITAL_TABLES.get(hospital_name)
    if not table:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    patients = db.search_patients(table, q)
    return patients
