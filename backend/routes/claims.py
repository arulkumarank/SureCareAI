from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
import uuid
import logging
from config import supabase_config as db
from config.settings import UPLOAD_DIR
from agents.pipeline import run_pipeline

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/claims", tags=["Claims"])

class ClaimCreate(BaseModel):
    user_id: str
    hospital_name: str
    patient_id: str
    patient_name: str
    insurance_company: str
    policy_code: str
    claim_amount: float = 0.0

@router.post("/")
def create_claim(claim: ClaimCreate):
    """Create a new insurance claim draft."""
    data = claim.dict()
    data["status"] = "draft"
    
    # Try to load policy name
    from config.settings import INSURANCE_TABLES
    policy_table = INSURANCE_TABLES.get(claim.insurance_company)
    if policy_table:
        policy = db.get_policy_by_code(policy_table, claim.policy_code)
        if policy:
            data["policy_name"] = policy.get("policy_name")
    
    new_claim = db.create_claim(data)
    return new_claim

@router.get("/user/{user_id}")
def get_user_claims(user_id: str):
    """List all claims for a given user."""
    return db.get_claims_by_user(user_id)

@router.get("/{claim_id}")
def get_claim_details(claim_id: str):
    """Get full details of a specific claim, including docs and reports."""
    claim = db.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    docs = db.get_claim_documents(claim_id)
    # Filter out parsed data to keep response lightweight
    for doc in docs:
        doc.pop("parsed_data", None)
        
    reports = db.get_ai_reports(claim_id)
    
    return {
        "claim": claim,
        "documents": docs,
        "ai_reports": reports
    }

@router.post("/{claim_id}/documents")
async def upload_claim_document(
    claim_id: str,
    document_type: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload a document for a claim."""
    claim = db.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    file_bytes = await file.read()
    
    # Upload to Supabase Storage
    # Filename format: claim_id/uuid_original.ext
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{claim_id}/{uuid.uuid4()}.{ext}"
    
    file_url = db.upload_to_storage("claim-documents", path, file_bytes, file.content_type)
    
    doc_data = {
        "claim_id": claim_id,
        "document_type": document_type,
        "file_name": file.filename,
        "file_url": file_url,
        "parsing_status": "pending"
    }
    
    new_doc = db.add_claim_document(doc_data)
    
    # Update claim status
    db.update_claim(claim_id, {"status": "documents_pending"})
    
    return new_doc

@router.post("/{claim_id}/process")
def process_claim_pipeline(claim_id: str, background_tasks: BackgroundTasks):
    """
    Trigger the AI pipeline to process the claim.
    Returns immediately, pipeline runs in background.
    For prototyping, we actually run it synchronously here to return the result,
    but in production it should be async.
    """
    # For the UI prototype, returning the result synchronously is easier.
    result = run_pipeline(claim_id)
    return result
