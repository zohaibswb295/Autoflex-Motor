# Renax Backend (Day 1-2)

Node.js + Express + MongoDB backend for the Renax website (vehicles, bookings, contact, newsletter).

## Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your real MongoDB Atlas connection string:
   ```
   cp .env.example .env
   ```

3. (Optional) Add sample data to your database:
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

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/test | Health check |
| GET | /api/vehicles?category=luxury | List vehicles (filter by category/type/brand/price) |
| GET | /api/vehicles/:id | Single vehicle details |
| POST | /api/vehicles | Add vehicle (admin) |
| PUT | /api/vehicles/:id | Update vehicle (admin) |
| DELETE | /api/vehicles/:id | Delete vehicle (admin) |
| POST | /api/bookings | Create a booking |
| GET | /api/bookings | List all bookings (admin) |
| PUT | /api/bookings/:id/status | Confirm/cancel a booking (admin) |
| POST | /api/contact | Submit contact form |
| GET | /api/contact | List messages (admin) |
| POST | /api/newsletter | Subscribe email |

## Categories (for the 4 frontend pillars)

Use the `category` query param to get data for each pillar:
- `luxury` → luxury-rentals page
- `economy` → economy-rentals page
- `used-car` → used-car-dealership page
- `workshop` → auto-workshop page

Example: `GET http://localhost:5000/api/vehicles?category=luxury`
