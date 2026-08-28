const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getBookings, updateBookingStatus } = require("../controllers/bookingController");
const {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");
const { getServiceBookings, updateServiceBookingStatus } = require("../controllers/serviceBookingController");

// Every route below requires a valid JWT belonging to an "admin" role user.
router.use(protect, adminOnly);

// ---- Rentals (bookings) management ----
router.get("/rentals", getBookings);
router.patch("/rentals/:id/status", updateBookingStatus);

// ---- Fleet (vehicle) management ----
router.get("/fleet", getVehicles);
const { protect } = require("../middleware/authMiddleware");
const {
  getFleet,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getRentals,
  updateRentalStatus,
} = require("../controllers/adminController");

// Every route below requires a valid admin token (Authorization: Bearer <token>)
router.use(protect);

router.get("/fleet", getFleet);
router.post("/fleet", createVehicle);
router.put("/fleet/:id", updateVehicle);
router.delete("/fleet/:id", deleteVehicle);

// ---- Workshop service bookings management ----
router.get("/service-bookings", getServiceBookings);
router.patch("/service-bookings/:id/status", updateServiceBookingStatus);
router.get("/rentals", getRentals);
router.patch("/rentals/:id/status", updateRentalStatus);

module.exports = router;
