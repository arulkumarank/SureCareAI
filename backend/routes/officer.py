from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import supabase_config as db
import uuid
import datetime

router = APIRouter(prefix="/api/officer", tags=["Officer Dashboard"])

class OfficerDecision(BaseModel):
    officer_notes: str
    approved_amount: float = 0.0
    rejection_reason: str = None

@router.get("/claims")
def list_officer_claims():
    """List all claims for the officer dashboard."""
    # We load all claims so officer can see history, 
    # but frontend will emphasize 'pending_approval'
    return db.get_all_claims_for_officer()

@router.post("/claims/{claim_id}/approve")
def approve_claim(claim_id: str, decision: OfficerDecision):
    """Approve a claim, generating a mock payment reference."""
    claim = db.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim["status"] not in ["pending_approval"]:
        raise HTTPException(status_code=400, detail=f"Cannot approve claim in status {claim['status']}")
    
    # Generate mock DD/Payment reference
    payment_ref = f"DD-{datetime.datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    update_data = {
        "status": "approved",
        "officer_notes": decision.officer_notes,
        "approved_amount": decision.approved_amount,
        "payment_reference": payment_ref
    }
    
    updated = db.update_claim(claim_id, update_data)
    return updated

@router.post("/claims/{claim_id}/reject")
def reject_claim(claim_id: str, decision: OfficerDecision):
    """Reject a claim by the officer."""
    claim = db.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim["status"] not in ["pending_approval"]:
        raise HTTPException(status_code=400, detail=f"Cannot reject claim in status {claim['status']}")
    
    update_data = {
        "status": "rejected",
        "officer_notes": decision.officer_notes,
        "rejection_reason": decision.rejection_reason or "Rejected by insurance officer."
    }
    
    updated = db.update_claim(claim_id, update_data)
    return updated
