# Booking Forms — Fix Notes

## What was broken
4 booking forms only did a plain page reload (`action="#0"`, no JS attached),
and one of them (homepage "Rent Now" popup) had a leftover `contact__form`
class that would have caused it to be silently hijacked by the site's
contact-form handler in `js/api-connect.js` and sent to `/api/contact`
instead of creating a real booking.

Affected forms:
1. Homepage — top "Book Auto Rental" search bar
2. Homepage — "Rent Now" popup modal
3. Services page — "Book Auto Rental" search bar
4. Luxury Rentals — "Book Your Chauffeur" bar
5. Commercial Fleet — "Book Your Fleet Vehicle" bar (had validation-only JS
   that checked fields but never actually submitted anywhere)

## What was fixed
- Added required Name / Email / Phone fields to every form above (the
  `Booking` model requires `customerName` + `email`, which none of these
  forms were collecting before).
- Gave every field a unique `id` and removed the conflicting
  `contact__form` class from the homepage modal.
- Created `frontend/js/booking-widget.js` — a new, self-contained script
  (same pattern as the existing `economy.js` / `dealership.js`) that wires
  all 5 forms to `POST /api/bookings`:
  - Validates name / email / phone client-side
  - Resolves a real vehicle to attach the booking to (matches the
    dropdown's category where possible — e.g. "Luxury Cars" → `luxury` —
    otherwise falls back to any available vehicle, so the booking still
    goes through even if no exact match exists)
  - Shows a success/error message inline and resets the form
- Included `booking-widget.js` right after `js/api-connect.js` on all 4
  pages. It's a no-op on any page that doesn't have these forms, so it's
  safe to include everywhere.
- **No backend changes were needed** — the booking API
  (`POST /api/bookings`, `GET /api/bookings`) and the admin panel
  (`GET /api/admin/rentals`, showing all bookings + a "Pending Bookings"
  stat) were already fully built and already correct.

## Before you run it
The backend needs your MongoDB Atlas cluster to allow the connecting IP:

1. Go to MongoDB Atlas → your cluster → **Network Access**
2. Add your machine's current IP (or `0.0.0.0/0` for local testing only —
   not recommended for production)
3. Then: `cd backend && npm install && node server.js`
4. Serve the frontend with any static server (not `file://`, since `fetch`
   calls to `localhost:5000` work more reliably over `http://`), e.g.
   `npx serve frontend` or a Live Server extension in VS Code.

## How to test end-to-end
1. Start the backend: `node server.js` (should print
   `MongoDB connected: ...`)
2. Open the homepage, fill in the "Book Auto Rental" bar (or the "Rent Now"
   popup) with a name, valid email, and phone, submit
3. You should see a green success message and the form reset
4. Open `frontend/src/pages/admin/index.html`, log in with
   `admin@renax.com` / `admin1234` (created by `node seed.js` if you
   haven't run it yet), and check the **Bookings** table — your new
   booking should appear there with status "Pending"
