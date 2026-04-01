# SureCare AI

> Enterprise AI-powered Insurance Claim Processing Platform — React + Vite frontend, FastAPI + Gemini backend.

## Overview

SureCare AI is a comprehensive insurance claim automation and prior authorization platform. It features a multi-role architecture designed for Patients, Hospitals, Insurance Companies, and Administrators.

At the core of the platform is a 3-agent Gemini pipeline that seamlessly processes and verifies insurance claims:
1. **Document Parser Agent**: Extracts unstructured data from medical records and bills.
2. **Verification Agent**: Cross-references patient admission status and hospital details against database records.
3. **Policy Checker Agent**: Evaluates the claim against policy coverage rules, enforcing active-claim limits and generating an AI verdict.

## Key Features

- **Multi-Role Dashboards**: Specifically tailored interfaces for Patients, Hospitals, Insurance Agents, and Admins.
- **AI-Guided Application Process**: A robust 6-step claim filing workflow.
- **Advanced Verification**: Live Aadhar camera capture and comprehensive AI verdict visualization.
- **Real-Time Analytics**: Dashboard for insurance companies to monitor claim trends and financials.
- **Smart Rule Enforcement**: Backend validation for one-active-claim-per-patient rule and live hospital admission checks.

---

## Project Structure

```text
virtusa/
├── backend/                    # Python FastAPI server
│   ├── agents/                 # AI agent pipeline (Gemini)
│   │   ├── document_parser_agent.py
│   │   ├── verification_agent.py
│   │   ├── policy_checker_agent.py
│   │   └── pipeline.py
│   ├── config/                 # Configuration (Supabase, AWS, etc)
│   ├── main.py                 # Entry point (uvicorn)
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Backend env template
│
├── frontend/                   # React + Vite UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/             # AI verdict visualizations
│   │   │   ├── layout/         # Navigation elements
│   │   │   └── workflow/       # Claim step progression
│   │   ├── pages/              # Role-based dashboards
│   │   ├── services/           # Supabase APIs, Auth
│   │   └── store/              # Zustand global state
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example            # Frontend env template
│
└── README.md
```

---

## Quick Start
Ensure you have Python 3.9+ and Node.js 18+ installed.

### Backend

```bash
cd backend
python -m venv venv              # Create virtual env (first time)
venv\Scripts\activate            # Windows (use `source venv/bin/activate` on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env             # Setup your environment variables
python main.py                   # Starts on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install                      # Install dependencies
cp .env.example .env             # Ensure Supabase & other variables are set
npm run dev                      # Starts on http://localhost:5173
```

---

## Environment Configuration

Both `frontend/.env` and `backend/.env` require specific environment variables to function properly, including Supabase credentials (URL, Service Role keys/Anon keys) and your Gemini API Key (`GEMINI_API_KEY`). Ensure you review the `.env.example` files in their respective directories.

---

## API Documentation

Once the backend is running, you can access the interactive API docs via:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
