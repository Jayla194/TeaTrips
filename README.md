# TeaTrips (Final Year Project)

## Repo Layout
- Backend (Express): `backend/`
- Frontend (Vite + React): `frontend/`
- Database schema: `backend/database/database.sql`

## Requirements
- Node.js + npm
- MySQL (local)

## Setup (Backend + Frontend)

### 1) Install dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Environment variables
`.env` files are ignored by Git (only `.env.example` is committed).

- Backend: copy `backend/.env.example` -> `backend/.env`
- Frontend: copy `frontend/.env.example` -> `frontend/.env`

Required frontend variables (local dev):
- `VITE_API_BASE_URL` (e.g. `http://localhost:5000`)

Required backend variables (local dev):
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DB_SSL`
- `JWT_SECRET`
- `CLIENT_URL` (should match the frontend dev URL, e.g. `http://localhost:5173`)

Optional backend variables:
- `API_KEY` (Google Gemini API key - required for AI-generated text via `backend/utils/llm.js`)

### 3) Database
Run the schema in MySQL:
```sql
source backend/database/database.sql;
```
Then import/populate the `locations` data (e.g. via MySQL Workbench / your provided import scripts).

### 4) Run the apps
Backend (port `5000`):
```bash
cd backend
npm run dev
```

Frontend (Vite dev server, typically `5173`):
```bash
cd frontend
npm run dev
```
