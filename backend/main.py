import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import os

# Load env variables before anything else
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# Output some config checks
from config.settings import GEMINI_API_KEY_1, SUPABASE_URL
log.info(f"Supabase configured: {'Yes' if SUPABASE_URL else 'No'}")
log.info(f"Agents configured: {'Yes' if GEMINI_API_KEY_1 else 'No'}")

# Import routers
from routes import hospitals, policies, claims, officer

# Initialize FastAPI App
app = FastAPI(
    title="SureCare AI API",
    description="Real-time multi-agent insurance claim processing.",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hospitals.router)
app.include_router(policies.router)
app.include_router(claims.router)
app.include_router(officer.router)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "SureCare AI"}

if __name__ == "__main__":
    import uvicorn
    # Use standard uvicorn runner for local dev
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
