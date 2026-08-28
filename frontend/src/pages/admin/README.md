# Fleet Admin Panel
Assigned to: Zohaib Nawaz (FS Lead)

Pillar: Shared Fleet Inventory & Booking API
- Uses backend/models/ (Vehicle/Rental Schemas)
- Uses backend/routes/ (REST API Endpoints)
- This folder: Fleet Admin Panel page (index.html)

## Status: Built ✅
- `index.html` — dashboard UI (same site template/branding: fonts, colors, buttons)
- Not linked from the public navbar (accessed via direct URL only)
- Stat cards: total vehicles, available vehicles, total bookings, pending bookings
- Vehicle Inventory: add / edit / delete, filterable by pillar (luxury, economy, used-car, workshop, commercial)
- Customer Bookings: list + change status (pending / confirmed / cancelled)
- All data is live — fetched from `http://localhost:5000/api/...` (see `frontend/js/admin.js`)
- Shows a warning banner if the backend server isn't reachable

## To test locally
1. `cd backend && npm install && npm start` (make sure `.env` has a working `MONGO_URI`)
2. Open `frontend/src/pages/admin/index.html` directly in the browser
3. Add a vehicle — it will immediately appear on the matching pillar page too (via `category`)
