"""
Supabase helper — thin wrapper around REST API calls.
Uses the Service Role Key for full access (bypasses RLS).
"""
import requests
import logging
from config.settings import SUPABASE_URL, SUPABASE_SERVICE_KEY

log = logging.getLogger(__name__)

HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


# ─── Generic helpers ─────────────────────────────────────────

def _url(table: str) -> str:
    return f"{SUPABASE_URL}/rest/v1/{table}"


def select(table: str, params: dict = None) -> list:
    """Select rows from a table. `params` are query-string filters."""
    r = requests.get(_url(table), headers=HEADERS, params=params or {})
    r.raise_for_status()
    return r.json()


def insert(table: str, data: dict | list) -> list:
    """Insert one or many rows."""
    r = requests.post(_url(table), headers=HEADERS, json=data)
    if r.status_code >= 400:
        log.error(f"Supabase insert error [{table}]: {r.status_code} {r.text}")
    r.raise_for_status()
    return r.json()


def update(table: str, match: dict, data: dict) -> list:
    """Update rows matching filter. match = {"column": "eq.value"}"""
    params = {f"{k}": f"eq.{v}" for k, v in match.items()}
    r = requests.patch(_url(table), headers=HEADERS, json=data, params=params)
    if r.status_code >= 400:
        log.error(f"Supabase update error [{table}]: {r.status_code} {r.text}")
    r.raise_for_status()
    return r.json()


def delete(table: str, match: dict) -> None:
    params = {f"{k}": f"eq.{v}" for k, v in match.items()}
    r = requests.delete(_url(table), headers=HEADERS, params=params)
    r.raise_for_status()


# ─── Hospital helpers ────────────────────────────────────────

def search_patients(table_name: str, query: str) -> list:
    """Search patients by name or patient_id (ilike)."""
    # Use OR filter: patient_name ilike or patient_id ilike
    params = {
        "or": f"(patient_name.ilike.%{query}%,patient_id.ilike.%{query}%)",
        "limit": "20",
    }
    return select(table_name, params)


def get_patient_by_id(table_name: str, patient_id: str) -> dict | None:
    """Get a single patient by their hospital patient_id."""
    rows = select(table_name, {"patient_id": f"eq.{patient_id}"})
    return rows[0] if rows else None


# ─── Policy helpers ──────────────────────────────────────────

def get_all_policies(table_name: str) -> list:
    return select(table_name)


def get_policy_by_code(table_name: str, policy_code: str) -> dict | None:
    rows = select(table_name, {"policy_code": f"eq.{policy_code}"})
    return rows[0] if rows else None


# ─── Claims helpers ──────────────────────────────────────────

def create_claim(data: dict) -> dict:
    rows = insert("claims", data)
    return rows[0] if rows else {}


def get_claims_by_user(user_id: str) -> list:
    return select("claims", {
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
    })


def get_claim(claim_id: str) -> dict | None:
    rows = select("claims", {"id": f"eq.{claim_id}"})
    return rows[0] if rows else None


def update_claim(claim_id: str, data: dict) -> dict:
    data["updated_at"] = "now()"
    rows = update("claims", {"id": claim_id}, data)
    return rows[0] if rows else {}


def get_pending_claims() -> list:
    """Get all claims with status=pending_approval for officers."""
    return select("claims", {
        "status": "eq.pending_approval",
        "order": "created_at.desc",
    })


def get_all_claims_for_officer() -> list:
    """Officers see all claims regardless of status."""
    return select("claims", {"order": "created_at.desc"})


# ─── Claim Documents helpers ─────────────────────────────────

def add_claim_document(data: dict) -> dict:
    rows = insert("claim_documents", data)
    return rows[0] if rows else {}


def get_claim_documents(claim_id: str) -> list:
    return select("claim_documents", {
        "claim_id": f"eq.{claim_id}",
        "order": "created_at.asc",
    })


def update_document(doc_id: str, data: dict) -> dict:
    rows = update("claim_documents", {"id": doc_id}, data)
    return rows[0] if rows else {}


# ─── AI Reports helpers ─────────────────────────────────────

def add_ai_report(data: dict) -> dict:
    rows = insert("ai_reports", data)
    return rows[0] if rows else {}


def get_ai_reports(claim_id: str) -> list:
    return select("ai_reports", {
        "claim_id": f"eq.{claim_id}",
        "order": "created_at.asc",
    })


# ─── Storage helpers ─────────────────────────────────────────

def upload_to_storage(bucket: str, path: str, file_content: bytes, content_type: str = "application/pdf") -> str:
    """Upload file to Supabase Storage. Returns public URL."""
    url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": content_type,
    }
    r = requests.post(url, headers=headers, data=file_content)
    if r.status_code == 409:
        # File already exists — that's ok
        pass
    elif r.status_code >= 400:
        log.error(f"Storage upload error: {r.status_code} {r.text}")
    
    # Return public URL
    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}"
