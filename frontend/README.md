# CEXIOS — Crypto Project Registry (Frontend v2)

A complete frontend redesign for the internal Business Development tool. **The backend is
untouched** — every API call in this project targets the exact same routes, methods, and
payload shapes your existing FastAPI backend already exposes.

---

## What changed

Only the frontend. Nothing here modifies, renames, or reshapes any backend endpoint.

| Existing backend route | Used by |
|---|---|
| `GET /api/v1/search?q=` | Search Projects page |
| `GET /api/v1/recent` | available via `projectService`, ready if you want it on a page |
| `POST /api/v1/upload` (form: `name`, `file`) | Upload Excel page |
| `POST /api/v1/admin/login` (form-urlencoded) | Admin Login page |
| `GET /api/v1/admin/dashboard` | Admin Dashboard, Settings, Export pages |
| `GET /api/v1/admin/projects` | Project Management page |
| `POST /api/v1/admin/projects` | Add Project modal |
| `PUT /api/v1/admin/projects/{id}` | Edit Project modal |
| `DELETE /api/v1/admin/projects/{id}` | Delete confirmation modal |
| `GET /api/v1/admin/uploads` | Upload History page, Dashboard |
| `GET /api/v1/admin/projects/export` | Export page, Projects table export button |

All of this lives in two files — `src/services/projectService.js` and
`src/services/adminService.js` — so if a route ever changes, that's the only place to update.

---

## Run it

```bash
npm install
cp .env.example .env      # VITE_API_URL, defaults to http://127.0.0.1:8000
npm run dev
```

Open `http://localhost:5173`. Make sure your existing FastAPI backend is running (with CORS
allowing `http://localhost:5173`) at the URL in `.env`.

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

---

## Design direction

- **Brand:** CEXIOS navy/blue palette (`#0A2540` primary, `#123C66` secondary, `#1E63FF`
  accent) on a light `#F5F7FB` enterprise background — Stripe/Coinbase/Linear-dashboard
  inspired, not copied.
- **Typography:** Inter, weights 400–700.
- **Shell:** persistent left sidebar (collapses to a slide-in drawer under `lg`) + sticky top
  navbar (search, notifications, profile menu) + footer, used by every in-app page. The
  landing page (`/`) and admin login (`/admin/login`) use their own full-bleed hero layouts
  instead, since they're entry points rather than working screens.
- **Motion:** Framer Motion for page transitions, hover/tap micro-interactions, modal
  enter/exit, and the dashboard's staggered stat cards — kept subtle and respects
  `prefers-reduced-motion`.
- **Feedback:** `react-hot-toast` for success/error across every mutating action (upload,
  login, save, delete, export).
- **Data states:** every table/list has a loading skeleton, an empty state, and (where
  relevant) pagination — search results, project management, upload history, and the
  dashboard's recent-activity list.

---

## Project structure

```
src/
  components/
    layout/        Sidebar, Navbar, Footer, PageTransition
    ui/             Button, Card, Input, Modal, Badge, StatCard, Skeleton,
                     EmptyState, ProgressBar, Pagination — the reusable primitives
    charts/         UploadsChart (Chart.js line chart, 14-day activity)
    ProtectedRoute.jsx
  context/          AuthContext (admin JWT + username)
  hooks/            useAuth, useDebounce, usePagination
  layouts/          DashboardLayout (sidebar + navbar + content + footer)
  pages/            Home, SearchPage, UploadPage, AdminLogin, AdminDashboardPage,
                     ProjectManagementPage, UploadHistoryPage, ExportPage,
                     SettingsPage, NotFound
  services/         api.js (axios instance), projectService.js, adminService.js
  utils/            cn.js (classnames), formatDate.js
```

No inline styles anywhere — Tailwind utility classes throughout, with brand tokens defined
once in `tailwind.config.js`.

---

## Pages ↔ sidebar map

| Sidebar item | Route | Auth |
|---|---|---|
| Search Projects | `/search` | Public |
| Upload Excel | `/upload` | Public |
| Dashboard | `/admin/dashboard` | Admin |
| Upload History | `/admin/uploads` | Admin |
| Projects | `/admin/projects` | Admin |
| Export | `/admin/export` | Admin |
| Settings | `/admin/settings` | Admin |

Admin-only routes are wrapped in `ProtectedRoute`, which redirects to `/admin/login` if no
token is present and sends you back to the page you wanted right after signing in.

---

## Honest notes

- **Settings → Admin Password:** your existing backend has no "change password" endpoint —
  the admin password hash is set via the `ADMIN_PASSWORD_HASH` environment variable at
  deploy time. Rather than fake a working form against a non-existent route, Settings
  explains this plainly and points to the real mechanism. If you'd like an actual in-app
  password-change flow, that needs one small new backend endpoint — say the word and I'll
  add it (the brief said not to touch the backend without asking first, so I held off).
- **Theme swatches:** Settings shows the brand palette as reference rather than shipping a
  dark-mode toggle with no real second theme behind it.
- I couldn't run `npm install` / `npm run dev` in this sandbox (no network access here), so
  every file was validated with `esbuild` (syntax check on all 37 source files) and a custom
  script confirming every relative import resolves to a real file, instead of a live browser
  test. If anything doesn't compile on your machine, send me the error and I'll fix it
  immediately.
