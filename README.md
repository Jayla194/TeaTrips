# TeaTrips (Final Year Project)

## Layout
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

- Backend: copy `backend/.env.example` -> `backend/.env`
- Frontend: copy `frontend/.env.example` -> `frontend/.env`

Required frontend variables (local dev):
- `VITE_API_BASE_URL` (e.g. `http://localhost:5000`)

Required backend variables (local dev):
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DB_SSL`
- `JWT_SECRET`
- `CLIENT_URL` (should match the frontend URL, e.g. `http://localhost:5173`)

Optional backend variables:
- `API_KEY` (Google Gemini API key - required for AI-generated text via `backend/utils/llm.js`)

### 3) Database
Run the schema in MySQL:
```sql
source backend/database/database.sql;
```

Then import the data using Node.js scripts:
```bash
cd backend
node database/importLocations.js
node database/importReviews.js
```

**Data Import Details:**
- **Locations**: Imported from `backend/data/locations.json` via `importLocations.js`
  - Preserves multiline descriptions with proper formatting
  - Sets `description_last_generated` to NULL
  
- **Reviews**: Imported from `backend/data/reviews.json` via `importReviews.js`
  - Handles special characters and formatting in comments
  - Converts empty strings to NULL for optional fields
  
- **Other tables** (users, saved_locations, itineraries, etc.): 
  - Import queries are available in `database.sql` if needed
  - Can be run directly in MySQL if you have CSV files

### 4) Run the apps
Backend (port `5000`):
```bash
cd backend
npm run dev
```

Frontend (Vite dev server ):
```bash
cd frontend
npm run dev
```

### Live Demo
The application is deployed and can be accessed here:
[Live Demo](https://tea-trips.vercel.app/)

or at  https://tea-trips.vercel.app/

*Note: The server may take a few seconds to start if inactive.*
