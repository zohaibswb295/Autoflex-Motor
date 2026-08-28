# Renax Project

## Structure
```
full-project/
├── backend/     ← Node.js + Express + MongoDB (see backend/README.md)
└── frontend/    ← Renax HTML/CSS template (already connected to the backend)
```

## How to run

1. **Start the backend first:**
   ```
   cd backend
   npm install
   cp .env.example .env      # then edit .env with your real MongoDB URI
   node seed.js               # optional: adds sample vehicles
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

2. **Open the frontend:**
   Open `frontend/index.html` with VS Code Live Server (or any static server).
   The pages are already wired to call the backend:
   - `contact.html` → contact form saves to MongoDB (`/api/contact`)
   - Every page's footer newsletter box → saves email (`/api/newsletter`)
   - `cars.html` → has a live example (`#vehicle-list`) that fetches real vehicles from MongoDB and renders them as cards

## Adding a dynamic listing to any of the 4 pillar pages

Anywhere in the page HTML, add:
```html
<div class="row" id="vehicle-list" data-category="luxury"></div>
```
Change `data-category` to `luxury`, `economy`, `used-car`, or `workshop` depending on which pillar page it is. `js/api-connect.js` (already included on every page) will automatically fetch and render the matching vehicles.

## What's implemented so far
- Core schemas: Vehicles, Rentals (Bookings), Service Bookings (workshop), Contacts, Newsletter, Users
- JWT auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) with an `authMiddleware.protect` /
  `adminOnly` guard for admin-only routes
- Public fleet & rental endpoints (`/api/fleet`, `/api/rentals`, `/api/service-booking`) plus the original
  `/api/vehicles` / `/api/bookings` naming kept alive for backward compatibility
- Protected `/api/admin/*` namespace for fleet & rental/service-booking management
- Global + per-route rate limiting and a centralized error handler (see `backend/README.md` for details)
- Admin panel UI (`frontend/src/pages/admin/`) — table view for supervisors to manage vehicles & bookings
- Postman collection at `backend/postman_collection.json`

See `backend/README.md` for the full endpoint list and deployment steps.

## Next steps
- Point the admin panel at the new protected `/api/admin/*` routes (with a login screen) instead of the
  open legacy `/api/vehicles` / `/api/bookings` routes
- Duplicate `cars.html` into `luxury-rentals/`, `economy-rentals/`, `used-car-dealership/`, `auto-workshop/`
  folders and set the right `data-category` on each
- Wire up the service-booking form on the auto-workshop pillar page to `/api/service-booking`
- Deploy the backend (Render/Railway) and update `API_BASE_URL` in `frontend/js/api-connect.js`
