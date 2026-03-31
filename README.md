# AutoAuth AI

> AI-powered Prior Authorization platform — React + Vite frontend, FastAPI + Gemini backend.

---

## Project Structure

```
virtusa/
├── backend/                    # Python FastAPI server
│   ├── agents/                 # AI agent modules (Gemini)
│   │   ├── clinical_reader_agent.py
│   │   ├── evidence_builder_agent.py
│   │   └── policy_intelligence_agent.py
│   ├── config/                 # Configuration (Supabase)
│   │   └── supabase_config.py
│   ├── analysis_agent.py       # Core FastAPI app & /api/analyze route
│   ├── main.py                 # Entry point (uvicorn)
│   ├── requirements.txt        # Python dependencies
│   ├── venv/                   # Python virtual environment (gitignored)
│   └── .env.example            # Backend env template
│
├── frontend/                   # React + Vite UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/             # AI result components
│   │   │   ├── layout/         # Navbar, Topbar, Sidebar
│   │   │   ├── shared/         # ErrorBoundary, TechStackModal
│   │   │   ├── ui/             # Primitive UI components
│   │   │   └── workflow/       # Agent workflow visualisation
│   │   ├── pages/              # Route-level pages
│   │   ├── services/           # API / auth / analytics services
│   │   ├── context/            # React context (Auth)
│   │   ├── store/              # Zustand stores
│   │   ├── lib/                # Supabase client, utilities
│   │   └── data/               # Static sample data
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── node_modules/           # Node dependencies (gitignored)
│   ├── .env                    # Frontend env vars (gitignored)
│   └── .env.example            # Frontend env template
│
├── .gitignore
└── README.md
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv              # Create virtual env (first time)
venv\Scripts\activate            # Windows
pip install -r requirements.txt
python main.py                   # Starts on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install                      # Install dependencies (first time)
npm run dev                      # Starts on http://localhost:5173
```

---

## Demo Credentials

| Role   | Email             | Password |
|--------|-------------------|----------|
| Admin  | admin@autoauth.ai | admin123 |
| Doctor | doctor@demo.com   | demo123  |

---

## Environment Variables

```bash
# Frontend — copy frontend/.env.example → frontend/.env
cp frontend/.env.example frontend/.env

# Backend — copy backend/.env.example → backend/.env
cp backend/.env.example backend/.env
```

---

## API

Once backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
# SureCareAI
