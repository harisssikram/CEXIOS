# Ledger — Crypto Project Registry

A small full-stack app for tracking crypto projects as a team:

- **Public search** — anyone can look up a project by ticker or name, no login.
- **Public upload** — anyone can enter their name and upload an `.xlsx` / `.xls` / `.csv`
  file to add new projects. Duplicates (matched by **ticker**, then by **website**) are
  skipped automatically.
- **Admin panel** — a single admin account can view/add/edit/delete projects, see upload
  history, and export everything to Excel.

Stack: **FastAPI** + **SQLAlchemy** (backend) · **React + Vite + Tailwind** (frontend) ·
**Postgres** (Neon, or SQLite for local dev — no setup required to try it locally).

---

## 1. Run it locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Generate a bcrypt hash for your admin password:
python set_admin_password.py "YourNewPassword123"
# Paste the printed hash into .env as ADMIN_PASSWORD_HASH=...
# Also set JWT_SECRET_KEY to a long random string.

uvicorn app.main:app --reload --port 8000
```

The backend creates its tables automatically on first run (via `Base.metadata.create_all`).
With `DATABASE_URL` left unset, it uses a local `crypto_registry.db` SQLite file — nothing
else to configure. Visit `http://localhost:8000/docs` for interactive API docs.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. It talks to the backend at `http://localhost:8000` by default
(override with a `VITE_API_URL` env var / `frontend/.env`).

---

## 2. Try it out

1. Go to **Upload**, enter a name, and upload a spreadsheet with columns
   `Project Name`, `Ticker`, `Website` (optional: `CEO`, `Telegram`, `Notes`).
2. Go to **Search** and look up a project by ticker or name.
3. Go to **Admin**, sign in with the username/password you set above, and you'll see
   the dashboard, project management, upload history, and an **Export** button.

A sample file is included at `sample-data/sample_projects.csv` to upload for testing.

---

## 3. Switching to Neon Postgres

1. Create a free project at [neon.tech](https://neon.tech) and copy its connection string.
2. In `backend/.env`, set:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-west-2.neon.tech/neondb?sslmode=require
   ```
3. Install the Postgres driver (already in `requirements.txt`: `psycopg2-binary`).
4. Restart the backend — tables are created automatically the same way.

---

## 4. Deploying

- **Database**: Neon (see above). Keep the connection string only in environment
  variables, never committed to git.
- **Backend**: deploy to Render (or any host that runs `uvicorn app.main:app`).
  Set `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET_KEY`, and
  `CORS_ORIGINS` (your frontend's URL) as environment variables in the dashboard.
- **Frontend**: deploy to Vercel (or Netlify). Build command `npm run build`, output
  dir `dist`. Set `VITE_API_URL` to your deployed backend's URL.

Both platforms auto-deploy on push to `main` once connected to your GitHub repo.

---

## 5. Project layout

```
backend/
  app/
    main.py        # FastAPI app, CORS, router registration
    config.py       # env-based settings
    database.py    # SQLAlchemy engine/session
    models.py       # Project, Upload tables
    schemas.py      # Pydantic request/response models
    auth.py         # password hashing + JWT
    crud.py         # DB access functions
    utils.py        # Excel/CSV parsing + duplicate detection
    routers/
      projects.py   # public: /search, /recent, /upload
      admin.py      # admin: /login, /dashboard, /projects CRUD, /uploads, /export
  set_admin_password.py
  requirements.txt
  .env.example

frontend/
  src/
    App.jsx, main.jsx
    components/     # Header, TickerTape
    pages/          # SearchPage, UploadPage, AdminLogin, AdminDashboard
    utils/api.js    # axios instance (attaches admin JWT)
  package.json
```

## 6. Notes & things worth tightening before production

- The admin JWT is stored in `localStorage` for simplicity; if you want stronger XSS
  protection, move to an httpOnly cookie issued by the backend instead.
- Excel uploads are processed in-memory row by row — fine for moderate files (thousands
  of rows); for very large files, consider batching inserts or a background job.
- `CORS_ORIGINS` defaults to `http://localhost:5173` — set it to your real frontend
  domain(s) in production.
- Rotate your Neon connection string and admin password periodically, and never commit
  `.env` (already covered by `.gitignore`).
