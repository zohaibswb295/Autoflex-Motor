# Renax Backend

Node.js + Express + MongoDB backend for the Renax website (fleet, rentals, service bookings, contact, newsletter, auth).

## Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your real MongoDB Atlas connection string and a JWT secret:
   ```
   cp .env.example .env
   ```

3. Add sample data to your database (also creates an admin login: `admin@renax.com` / `admin1234`):
   ```
   node seed.js
   ```

4. Start the server:
   ```
   npm run dev
   ```
   You should see:
   ```
   MongoDB connected: cluster0-xxxxx.mongodb.net
   Server running on http://localhost:5000
   ```

## API Endpoints

A ready-to-import Postman collection covering every endpoint below is at `postman_collection.json`.

Every request under `/api` goes through a global rate limiter (300 req / 15 min / IP). `/api/auth/*` and the
public write endpoints (`/api/rentals`, `/api/service-booking`, `/api/bookings`) have their own tighter limits
(`middleware/rateLimiter.js`). All errors return the same shape `{ success: false, error: "..." }` via the
centralized handler in `middleware/errorHandler.js`.

### Auth (JWT)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Create an account, returns a JWT |
| POST | /api/auth/login | Log in, returns a JWT |
| GET | /api/auth/me | Get the logged-in user (requires `Authorization: Bearer <token>`) |

### Fleet & Vehicles

`/api/fleet` and `/api/vehicles` are the same router mounted twice — use whichever name fits, both are live.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/fleet?category=luxury | List vehicles (filter by category/type/brand/price) |
| GET | /api/fleet/:id | Single vehicle details |
| POST | /api/vehicles | Add vehicle (used today by the admin panel, unauthenticated for backward compatibility — see note below) |
| PUT | /api/vehicles/:id | Update vehicle |
| DELETE | /api/vehicles/:id | Delete vehicle |

### Rentals & Service Bookings

`/api/rentals` and `/api/bookings` are the same router mounted twice, same idea as fleet/vehicles above.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/rentals | Create a rental request (validated: vehicle, customerName, valid email, valid date range) |
| GET | /api/bookings | List all rentals (admin) |
| PUT | /api/bookings/:id/status | Confirm/cancel a rental |
| POST | /api/service-booking | Request a workshop service (validated: service id, customerName, valid email, phone) |
| GET | /api/service-booking | List service bookings (admin, JWT required) |
| PATCH | /api/service-booking/:id/status | Update a service booking's status (admin, JWT required) |

### Admin namespace (JWT + `role: admin` required on every route)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/admin/rentals | List all rentals |
| PATCH | /api/admin/rentals/:id/status | Confirm/cancel a rental |
| GET | /api/admin/fleet | List all vehicles |
| POST/PUT/DELETE | /api/admin/fleet(/:id) | Manage vehicles |
| GET | /api/admin/service-bookings | List all workshop service bookings |
| PATCH | /api/admin/service-bookings/:id/status | Update a service booking's status |

> **Note on the existing admin panel:** `frontend/js/admin.js` currently calls `/api/vehicles` and
> `/api/bookings` directly without a token, so those legacy routes were kept open to avoid breaking it.
> The new `/api/admin/*` routes are the properly protected versions — swap the admin panel over to them
> (sending `Authorization: Bearer <token>` from a logged-in admin) whenever the team is ready to fully lock
> down fleet/booking management.

### Contact & Newsletter

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/test | Health check |
| POST | /api/contact | Submit contact form |
| GET | /api/contact | List messages (admin) |
| POST | /api/newsletter | Subscribe email |

## Deploying (Render / Railway)

The backend is stateless and reads all config from environment variables, so it deploys as-is:

1. Push this repo to GitHub.
2. On Render or Railway, create a new **Web Service** pointing at the `backend/` folder.
   - Build command: `npm install`
   - Start command: `node server.js` (a `Procfile` is included for platforms that read one)
3. Set the environment variables from `.env.example` in the platform's dashboard: `MONGO_URI`, `JWT_SECRET`,
   `JWT_EXPIRES_IN`, and optionally `EMAIL_USER` / `EMAIL_PASS`. Do **not** commit real values to `.env`.
4. Once deployed, update `API_BASE_URL` in `frontend/js/api-connect.js` to the live URL
   (e.g. `https://renax-backend.onrender.com/api`) before deploying the frontend.
5. Run `node seed.js` once against the production `MONGO_URI` (locally, with `.env` pointed at prod) if you
   want the sample vehicles + admin login in the live database.

## Categories (for the 4 frontend pillars)

Use the `category` query param to get data for each pillar:
- `luxury` → luxury-rentals page
- `economy` → economy-rentals page
- `used-car` → used-car-dealership page
- `workshop` → auto-workshop page

Example: `GET http://localhost:5000/api/vehicles?category=luxury`
