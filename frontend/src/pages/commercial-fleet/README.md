# Commercial Fleet & Leasing

**Assigned to:** Muhammad Huzaifa Faizan (Frontend)
**Pillar:** Commercial Fleet & Leasing
**Branch:** `feature/huzaifafaizan-commercial-fleet`

## Pages in this folder

| File | Purpose |
|---|---|
| `index.html` | Main pillar landing page — hero, fleet overview, booking form, links to all 3 sub-pages |
| `cargo-pickup-leasing.html` | Sub-page: Cargo Pickup Truck Leasing |
| `corporate-employee-transport.html` | Sub-page: Corporate Employee Transport |
| `tour-bus-coaster-rentals.html` | Sub-page: Tour Bus & Coaster Rentals |

## How this was built

Built using the shared RENAX template structure (navbar, footer, fonts, CSS/JS from
`frontend/css` and `frontend/js`) as the base. Each page follows the site-wide layout,
booking form pattern, and styling conventions already established in the template.

All asset paths are relative and assume the files live exactly at:
`frontend/src/pages/commercial-fleet/`

## Known issues / TODO

- **Vehicle images are placeholders.** The current photos are RENAX's default demo
  images (generic sports cars/SUVs), not real cargo trucks, vans, or coaches. These
  need to be swapped for accurate commercial-vehicle photos before final submission.
- **`#vehicle-list` shows "No vehicles found."** This is expected — it's populated
  dynamically by `js/api-connect.js` (Zohaib's backend connector) once vehicles with
  `category: "commercial"` exist in MongoDB. Not a frontend bug.
- Booking form (`Get Quote` / `Reserve Now`) is frontend-only for now — no backend
  submission handler wired up yet.

## How to run locally (Codespaces)

```bash
cd /workspaces/Autoflex-Motor
npx --yes serve frontend -l 5500
```

Then open the **exact file path** in the browser — not just the folder:

```
http://localhost:5500/src/pages/commercial-fleet/index.html
```

⚠️ Opening just the folder path (without `/index.html`) breaks relative asset paths
for CSS/JS/images. Always include the full filename.

## Notes for the team

- Keep navbar, footer, and global CSS/JS links untouched when editing these pages.
- Any new commercial-fleet vehicle data should use `category: "commercial"` in
  MongoDB so it surfaces automatically in the `#vehicle-list` grid.