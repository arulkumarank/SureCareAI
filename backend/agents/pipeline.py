"""
Pipeline Orchestrator — runs the 3-agent pipeline on a claim.

Flow:
  1. Document Parser → parse all uploaded docs
  2. Verification Agent → cross-check with hospital DB + identity
  3. Policy Checker → compare against insurance policy T&C
  4. Final decision → update claim status
"""
import logging
import json
from config import supabase_config as db
from config.settings import HOSPITAL_TABLES, INSURANCE_TABLES
from agents.document_parser_agent import parse_document
from agents.verification_agent import verify_claim
from agents.policy_checker_agent import check_policy

log = logging.getLogger(__name__)


def run_pipeline(claim_id: str) -> dict:
    """
    Execute the full 3-agent pipeline for a claim.
    Returns the complete AI report.
    """
    # ─── Load claim ──────────────────────────────────────────
    claim = db.get_claim(claim_id)
    if not claim:
        return {"error": "Claim not found"}
    
    db.update_claim(claim_id, {"status": "processing"})
    
    # ─── Load hospital patient record ────────────────────────
    hospital_table = HOSPITAL_TABLES.get(claim["hospital_name"])
    if not hospital_table:
        db.update_claim(claim_id, {"status": "rejected", "rejection_reason": "Unknown hospital"})
        return {"error": f"Unknown hospital: {claim['hospital_name']}"}
    
    patient_record = db.get_patient_by_id(hospital_table, claim["patient_id"])
    if not patient_record:
        db.update_claim(claim_id, {
            "status": "rejected",
            "rejection_reason": f"Patient {claim['patient_id']} not found in {claim['hospital_name']} database"
        })
        return {"error": "Patient not found in hospital DB", "status": "rejected"}
    
    # ─── Load insurance policy ───────────────────────────────
    policy_table = INSURANCE_TABLES.get(claim["insurance_company"])
    if not policy_table:
        db.update_claim(claim_id, {"status": "rejected", "rejection_reason": "Unknown insurance company"})
        return {"error": f"Unknown insurance company: {claim['insurance_company']}"}
    
    policy = db.get_policy_by_code(policy_table, claim["policy_code"])
    if not policy:
        db.update_claim(claim_id, {"status": "rejected", "rejection_reason": "Invalid policy code"})
        return {"error": f"Policy {claim['policy_code']} not found"}
    
    # ─── Load uploaded documents ─────────────────────────────
    documents = db.get_claim_documents(claim_id)
    if not documents:
        db.update_claim(claim_id, {"status": "documents_pending"})
        return {"error": "No documents uploaded yet"}
    
    # ═══════════════════════════════════════════════════════════
    # AGENT 1: Document Parser
    # ═══════════════════════════════════════════════════════════
    log.info(f"[Claim {claim_id}] Agent 1: Document Parser starting...")
    parsed_documents = []
    
    for doc in documents:
        if doc.get("parsed_data") and doc.get("parsing_status") == "parsed":
            # Already parsed — reuse
            parsed_documents.append(doc["parsed_data"])
            continue
        
        # Download file from storage and parse
        try:
            import requests as req
            file_url = doc.get("file_url", "")
            if file_url:
                resp = req.get(file_url)
                file_content = resp.content
            else:
                file_content = b""
            
            parsed = parse_document(file_content, doc["file_name"], doc["document_type"])
            parsed_documents.append(parsed)
            
            # Save parsed data back to the document record
            db.update_document(doc["id"], {
                "parsed_data": json.loads(json.dumps(parsed, default=str)),
                "parsing_status": "parsed",
            })
        except Exception as e:
            log.error(f"Error parsing doc {doc['id']}: {e}")
            parsed_documents.append({
                "_document_type": doc["document_type"],
                "_file_name": doc["file_name"],
                "error": str(e),
                "extraction_confidence": 0
            })
            db.update_document(doc["id"], {"parsing_status": "failed"})
    
    # Save Agent 1 report
    db.add_ai_report({
        "claim_id": claim_id,
        "agent_name": "Document Parser Agent",
        "agent_input": {"document_count": len(documents)},
        "agent_output": {"parsed_count": len(parsed_documents), "documents": parsed_documents},
        "confidence": sum(d.get("extraction_confidence", 0) for d in parsed_documents) / max(len(parsed_documents), 1),
    })
    
    # ═══════════════════════════════════════════════════════════
    # AGENT 2: Verification Agent
    # ═══════════════════════════════════════════════════════════
    log.info(f"[Claim {claim_id}] Agent 2: Verification Agent starting...")
    
    claim_info = {
        "claim_id": claim_id,
        "patient_name": claim["patient_name"],
        "patient_id": claim["patient_id"],
        "hospital_name": claim["hospital_name"],
        "claim_amount": float(claim.get("claim_amount", 0)),
    }
    
    verification = verify_claim(parsed_documents, patient_record, claim_info)
    
    db.add_ai_report({
        "claim_id": claim_id,
        "agent_name": "Verification Agent",
        "agent_input": claim_info,
        "agent_output": verification,
        "confidence": verification.get("verification_score", 0),
    })
    
    # If verification fails hard — reject early
    if not verification.get("overall_verified", False):
        if not verification.get("identity_verified", False):
            db.update_claim(claim_id, {
                "status": "verification_failed",
                "rejection_reason": "Identity verification failed. " + 
                    verification.get("identity_details", "Aadhar name does not match patient records."),
                "ai_report": {
                    "parsed_documents": parsed_documents,
                    "verification": verification,
                    "policy_check": None,
                    "final_decision": "REJECTED",
                    "rejection_stage": "verification",
                },
                "ai_confidence_score": verification.get("verification_score", 0),
            })
            return {
                "status": "verification_failed",
                "verification": verification,
                "needs_additional_documents": verification.get("missing_documents", []),
            }
    
    # ═══════════════════════════════════════════════════════════
    # AGENT 3: Policy Checker
    # ═══════════════════════════════════════════════════════════
    log.info(f"[Claim {claim_id}] Agent 3: Policy Checker Agent starting...")
    
    policy_result = check_policy(
        claim_info=claim_info,
        hospital_patient_record=patient_record,
        verification_report=verification,
        policy_data=policy,
        parsed_documents=parsed_documents,
    )
    
    db.add_ai_report({
        "claim_id": claim_id,
        "agent_name": "Policy Checker Agent",
        "agent_input": {"policy_code": claim["policy_code"]},
        "agent_output": policy_result,
        "confidence": policy_result.get("policy_score", 0),
    })
    
    # ═══════════════════════════════════════════════════════════
    # FINAL DECISION
    # ═══════════════════════════════════════════════════════════
    overall_score = (
        verification.get("verification_score", 0) * 0.4 +
        policy_result.get("policy_score", 0) * 0.6
    )
    
    full_report = {
        "parsed_documents": parsed_documents,
        "verification": verification,
        "policy_check": policy_result,
        "overall_score": round(overall_score, 1),
    }
    
    if policy_result.get("overall_eligible", False) and verification.get("overall_verified", False):
        # Send to officer for final approval
        full_report["final_decision"] = "PENDING_APPROVAL"
        full_report["recommended_amount"] = policy_result.get("recommended_amount", 0)
        
        db.update_claim(claim_id, {
            "status": "pending_approval",
            "ai_confidence_score": overall_score,
            "ai_report": json.loads(json.dumps(full_report, default=str)),
            "claim_amount": policy_result.get("recommended_amount", claim.get("claim_amount", 0)),
        })
    else:
        # Auto-reject
        reasons = policy_result.get("rejection_reasons", []) + verification.get("issues", [])
        full_report["final_decision"] = "REJECTED"
        full_report["rejection_reasons"] = reasons
        
        db.update_claim(claim_id, {
            "status": "rejected",
            "ai_confidence_score": overall_score,
            "ai_report": json.loads(json.dumps(full_report, default=str)),
            "rejection_reason": "; ".join(reasons[:3]) if reasons else "Policy requirements not met",
        })
    
    log.info(f"[Claim {claim_id}] Pipeline complete. Decision: {full_report['final_decision']}")
    return full_report
