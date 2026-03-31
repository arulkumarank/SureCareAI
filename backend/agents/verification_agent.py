"""
Verification Agent — Gemini API Key #2
Cross-checks extracted document data against the hospital DB records
and verifies identity (Aadhar name ↔ patient name match).
"""
import google.generativeai as genai
import json
import logging
from config.settings import GEMINI_API_KEY_2

log = logging.getLogger(__name__)

genai.configure(api_key=GEMINI_API_KEY_2)


def verify_claim(
    parsed_documents: list[dict],
    hospital_patient_record: dict,
    claim_info: dict,
) -> dict:
    """
    Verify the claim by cross-checking:
    1. Patient identity — does Aadhar name match hospital record name?
    2. Hospital record — does the bill match the hospital's patient record?
    3. Document completeness — are all required documents present and valid?
    
    Returns a verification report.
    """
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    # Separate documents by type
    aadhar_docs = [d for d in parsed_documents if d.get("_document_type") == "aadhar"]
    bill_docs = [d for d in parsed_documents if d.get("_document_type") == "hospital_bill"]
    report_docs = [d for d in parsed_documents if d.get("_document_type") == "medical_report"]
    
    prompt = f"""You are a strict insurance claim verification agent. Your job is to cross-check
    the patient's submitted documents against the hospital's official records.
    
    === HOSPITAL DATABASE RECORD (source of truth) ===
    {json.dumps(hospital_patient_record, indent=2, default=str)}
    
    === CLAIM INFORMATION ===
    {json.dumps(claim_info, indent=2, default=str)}
    
    === PARSED AADHAR CARD DATA ===
    {json.dumps(aadhar_docs, indent=2, default=str) if aadhar_docs else "NO AADHAR DOCUMENT SUBMITTED"}
    
    === PARSED HOSPITAL BILL DATA ===
    {json.dumps(bill_docs, indent=2, default=str) if bill_docs else "NO HOSPITAL BILL SUBMITTED"}
    
    === PARSED MEDICAL REPORT DATA ===
    {json.dumps(report_docs, indent=2, default=str) if report_docs else "NO MEDICAL REPORT SUBMITTED"}
    
    Perform these verifications:
    1. IDENTITY CHECK: Does the name on the Aadhar card match the patient name in the hospital record?
       (Allow minor variations like middle names, initials, case differences)
    2. HOSPITAL RECORD CHECK: Does the hospital bill's patient name, patient ID, hospital name match the DB record?
    3. BILL AMOUNT CHECK: Does the bill amount match the hospital DB's total_bill_amount?
    4. DIAGNOSIS CHECK: Is the diagnosis on the bill/report consistent with the hospital DB?
    5. DOCUMENT COMPLETENESS: Are Aadhar, hospital bill, and medical report all present?
    
    Output JSON format:
    {{
        "identity_verified": true/false,
        "identity_details": "explanation of name matching result",
        "hospital_record_verified": true/false,
        "hospital_details": "explanation",
        "bill_amount_verified": true/false,
        "bill_details": "explanation",
        "diagnosis_consistent": true/false,
        "diagnosis_details": "explanation",
        "documents_complete": true/false,
        "missing_documents": ["list of missing document types"],
        "overall_verified": true/false,
        "verification_score": 0-100,
        "issues": ["list of any issues found"],
        "recommendations": ["what additional documents or actions are needed"]
    }}
    
    Be strict but fair. Output valid JSON only, no markdown.
    """
    
    try:
        response = model.generate_content(prompt)
        res_text = response.text.strip()
        if res_text.startswith("```json"):
            res_text = res_text[7:]
        if res_text.startswith("```"):
            res_text = res_text[3:]
        if res_text.endswith("```"):
            res_text = res_text[:-3]
        
        result = json.loads(res_text.strip())
        return result
    
    except Exception as e:
        log.error(f"Verification Agent error: {e}")
        return {
            "identity_verified": False,
            "hospital_record_verified": False,
            "documents_complete": False,
            "overall_verified": False,
            "verification_score": 0,
            "issues": [f"Verification agent error: {str(e)}"],
            "missing_documents": [],
            "recommendations": ["Please retry or contact support"]
        }
