"""
Document Parser Agent — Gemini API Key #1
Parses PDFs and images (hospital bills, reports, Aadhar photos)
and extracts structured data.
"""
import google.generativeai as genai
import json
import base64
import logging
from config.settings import GEMINI_API_KEY_1

log = logging.getLogger(__name__)

genai.configure(api_key=GEMINI_API_KEY_1)


def parse_document(file_content: bytes, file_name: str, document_type: str) -> dict:
    """
    Parse a document (PDF or image) and extract structured data.
    
    document_type: 'hospital_bill', 'medical_report', 'aadhar', 'prescription', 'other_id'
    """
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    # Determine if image or PDF
    is_image = file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))
    is_pdf = file_name.lower().endswith('.pdf')
    
    prompts = {
        "hospital_bill": """Extract the following from this hospital bill:
            - patient_name, patient_id, hospital_name
            - admission_date, discharge_date
            - diagnosis, treatment_details
            - itemized_charges (list of {item, amount})
            - total_amount
            - attending_doctor
            - any insurance or TPA references""",
        
        "medical_report": """Extract the following from this medical report:
            - patient_name, patient_id
            - report_type (e.g., blood test, MRI, X-ray, discharge summary)
            - date_of_report
            - findings (detailed)
            - diagnosis
            - recommendations
            - doctor_name""",
        
        "aadhar": """Extract the following from this Aadhar card image:
            - full_name (exactly as printed)
            - aadhar_number (12-digit number, mask middle digits as XXXX)
            - date_of_birth
            - gender
            - address (if visible)
            Note: This is an Indian government ID card.""",
        
        "prescription": """Extract the following from this prescription:
            - patient_name
            - doctor_name, doctor_registration_number
            - date
            - medications (list of {name, dosage, frequency, duration})
            - diagnosis""",
        
        "other_id": """Extract any identifying information from this document:
            - document_type
            - full_name
            - id_number
            - date_of_birth (if present)
            - any other relevant details"""
    }
    
    prompt = f"""You are an expert document parser for an insurance claim system.
    
    {prompts.get(document_type, prompts["other_id"])}
    
    Output MUST be valid JSON only. No markdown formatting.
    If a field cannot be extracted, use null.
    Add a field "extraction_confidence" with a value 0-100 indicating how confident you are.
    """
    
    try:
        if is_image:
            # Use Gemini Vision for images
            image_data = base64.standard_b64encode(file_content).decode("utf-8")
            mime = "image/jpeg" if file_name.lower().endswith(('.jpg', '.jpeg')) else "image/png"
            if file_name.lower().endswith('.webp'):
                mime = "image/webp"
            
            response = model.generate_content([
                prompt,
                {"mime_type": mime, "data": image_data}
            ])
        elif is_pdf:
            # For PDFs, use Gemini with the document
            from pypdf import PdfReader
            import io
            
            pdf = PdfReader(io.BytesIO(file_content))
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            
            response = model.generate_content(f"{prompt}\n\nDocument text:\n{text}")
        else:
            # Treat as text
            text = file_content.decode("utf-8", errors="ignore")
            response = model.generate_content(f"{prompt}\n\nDocument text:\n{text}")
        
        # Parse response
        res_text = response.text.strip()
        if res_text.startswith("```json"):
            res_text = res_text[7:]
        if res_text.startswith("```"):
            res_text = res_text[3:]
        if res_text.endswith("```"):
            res_text = res_text[:-3]
        
        parsed = json.loads(res_text.strip())
        parsed["_document_type"] = document_type
        parsed["_file_name"] = file_name
        return parsed
    
    except Exception as e:
        log.error(f"Document Parser Agent error: {e}")
        return {
            "_document_type": document_type,
            "_file_name": file_name,
            "error": str(e),
            "extraction_confidence": 0
        }
