# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DocConstruct is a construction document management system for Israeli building permits. It manages projects, licensed professionals, documents, and team members with AI-powered PDF extraction and auto-filling. The system is Hebrew-centric, supporting cities: Tel Aviv, Ramat Gan, Ramat Hasharon, and Raanana.

## Build & Run Commands

### Backend (Flask/Python 3.11)
```bash
cd DocConstructBe/
pip install -r requirements.txt
python run.py                    # Development server on port 5001
```
Production: `gunicorn --preload --bind 0.0.0.0:5001 --workers 2 --threads 2 run:app`

### Frontend (Next.js 12 / React 17 / TypeScript)
```bash
cd DocConstructFe/
npm install
npm run dev      # Development server on port 3000
npm run build    # Production build
npm start        # Start production server
```

### Full Stack (Docker)
```bash
docker-compose up --build        # Build and run all services
```
Services: nginx (443/80), frontend (3000), backend (5001), postgres (5432)

### Database
PostgreSQL 15. No Alembic — migrations are manual Python scripts in `DocConstructBe/database/migrations/`. Run them directly with Python.

## Architecture

### Backend (`DocConstructBe/`)

**Entry flow:** `run.py` → `app/__init__.py` (creates Flask app, initializes mail/executor/db/routes)

**Key layers:**
- **Routes** (`app/routes.py`) — REST API endpoint definitions, request parsing, response formatting. All routes prefixed with `/api/`.
- **Managers** (`app/api.py`, ~2600 lines) — All business logic. Static methods for reads, instance methods for writes. Classes: `ProjectManager`, `ProfessionalManager`, `ProjectDocumentManager`, `ProjectTeamManager`, `ProjectCommentsManager`, `UserManager`.
- **Models** (`data_model/models.py`) — SQLAlchemy ORM models with UUID primary keys. Tables: users, projects, professionals, project_professionals (junction), project_documents, professional_documents, project_team_members, project_comments.
- **Enums** (`data_model/enum.py`) — City, ProjectStatus, ProjectDocumentType, ProfessionalType, DocumentStatus, ProjectTeamRole. Document types are city-specific and named in Hebrew.
- **AI/LLM** (`ai/llm.py`) — Claude Vision API integration for extracting structured data from professional license images/PDFs.
- **Document Processing** (`doc_map/doc_map.py`) — YAML-config-driven document type mapping and PDF auto-filling using PyPDF2 + reportlab with Hebrew font support.
- **Database** (`database/database.py`) — SQLAlchemy engine with scoped sessions. `session_scope()` context manager for transactions.
- **Decorators** (`app/decorators.py`) — `@jwt_required` for auth, `@auto_rollback` for transaction safety.
- **Validation** (`app/api_schema.py`) — Marshmallow schemas for request validation.

**Config:** `config/app_config.py` (Flask/mail settings), `config/sys_config.py` (paths, secrets, logging). Both load from `.env`.

### Frontend (`DocConstructFe/src/`)

**Routing:** Next.js file-based routing in `pages/` — login, projects, professionals, users, municipalities.

**API Client** (`api.ts`) — Axios instance with JWT interceptor (token from cookies). Auto-redirects to login on 401.

**Types** (`types.ts`) — TypeScript interfaces mirroring backend models.

**Components** (`components/`) — Organized by feature (projects, professionals, login, municipalities) plus `shared/` for reusable components (Layout, Sidebar, FileArea, ConfirmDialog, etc.).

**UI:** Ant Design 5 + styled-components. Charts via chart.js/d3.

### Document Processing Pipeline
1. User uploads PDF → backend saves to `DOCUMENTS_FOLDER`
2. If auto-fill: validates required professionals are attached to project
3. YAML config maps document type → required professional types and field positions
4. PyPDF2 reads PDF, reportlab overlays text at coordinates (Hebrew font: Alef-Regular.ttf)
5. Filled PDF saved and status updated

### Authentication
JWT tokens generated in `UserManager.generate_jwt_token()`. Frontend stores in cookies (js-cookie). Backend validates via `@jwt_required` decorator on protected routes.

## Frontend Guidelines
- Prefer reusing existing components over creating new ones
- Maintain consistent page layout across all pages

## Environment Variables
Backend requires: `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`, `SECRET_KEY`, `CLAUDE_API_KEY`, `CLAUDE_MODEL_NAME`, mail config (`MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`). See `DocConstructBe/.env.example`.

Frontend requires: `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_PROTOCOL`, `PUBLIC_PORT`. See `DocConstructFe/.env.example`.
