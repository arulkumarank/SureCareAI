"""
Policy Checker Agent — Gemini API Key #3
Compares the verified claim against the selected insurance policy's
terms and conditions to determine coverage eligibility.
"""
import google.generativeai as genai
import json
import logging
from config.settings import GEMINI_API_KEY_3

log = logging.getLogger(__name__)

genai.configure(api_key=GEMINI_API_KEY_3)


def check_policy(
    claim_info: dict,
    hospital_patient_record: dict,
    verification_report: dict,
    policy_data: dict,
    parsed_documents: list[dict],
) -> dict:
    """
    Check if the insurance policy covers this claim.
    
    Returns a policy assessment report with coverage decision.
    """
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""You are a senior insurance policy assessment agent. You must determine whether
    the patient's claim is covered under their selected insurance policy.
    
    === INSURANCE POLICY DETAILS ===
    Policy Name: {policy_data.get('policy_name')}
    Policy Code: {policy_data.get('policy_code')}
    Coverage Type: {policy_data.get('coverage_type')}
    Maximum Coverage: ₹{policy_data.get('max_coverage_amount', 0):,.2f}
    Covered Treatments: {json.dumps(policy_data.get('covered_treatments', []))}
    Excluded Treatments: {json.dumps(policy_data.get('excluded_treatments', []))}
    Waiting Period: {policy_data.get('waiting_period_days', 0)} days
    Co-pay: {policy_data.get('copay_percentage', 0)}%
    Required Documents: {json.dumps(policy_data.get('required_documents', []))}
    Terms & Conditions: {policy_data.get('terms_conditions', 'N/A')}
    Pre-existing Disease Clause: {policy_data.get('pre_existing_clause', 'N/A')}
    
    === CLAIM INFORMATION ===
    {json.dumps(claim_info, indent=2, default=str)}
    
    === HOSPITAL PATIENT RECORD ===
    {json.dumps(hospital_patient_record, indent=2, default=str)}
    
    === VERIFICATION REPORT ===
    {json.dumps(verification_report, indent=2, default=str)}
    
    === PARSED DOCUMENT SUMMARIES ===
    {json.dumps([{{
        "type": d.get("_document_type"),
        "file": d.get("_file_name"),
        "key_data": {{k: v for k, v in d.items() if not k.startswith("_")}}
    }} for d in parsed_documents], indent=2, default=str)}
    
    Evaluate:
    1. Is the treatment/diagnosis covered under this policy?
    2. Is the claim amount within the coverage limit?
    3. Are there any exclusions that apply?
    4. Is the waiting period satisfied?
    5. Are all required documents submitted?
    6. Does the pre-existing disease clause apply?
    7. What is the recommended approved amount (after co-pay deduction)?
    
    Output JSON:
    {{
        "policy_covers_treatment": true/false,
        "coverage_details": "explanation of why treatment is/isn't covered",
        "within_coverage_limit": true/false,
        "coverage_limit_details": "explanation",
        "exclusions_apply": true/false,
        "exclusion_details": "which exclusions apply, if any",
        "waiting_period_satisfied": true/false,
        "waiting_period_details": "explanation",
        "required_docs_submitted": true/false,
        "missing_required_docs": ["list"],
        "pre_existing_applies": true/false,
        "pre_existing_details": "explanation",
        "recommended_amount": number (after co-pay deduction),
        "copay_deduction": number,
        "overall_eligible": true/false,
        "policy_score": 0-100,
        "decision_summary": "2-3 sentence summary of the policy assessment",
        "rejection_reasons": ["list of reasons if not eligible"]
    }}
    
    Be thorough and fair. Output valid JSON only, no markdown formatting.
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
        log.error(f"Policy Checker Agent error: {e}")
        return {
            "policy_covers_treatment": False,
            "overall_eligible": False,
            "policy_score": 0,
            "decision_summary": f"Policy check failed: {str(e)}",
            "rejection_reasons": ["Policy assessment agent encountered an error"],
            "recommended_amount": 0,
        }
