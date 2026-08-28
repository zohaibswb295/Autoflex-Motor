const express = require("express");
const router = express.Router();
const {
  createServiceBooking,
  getServiceBookings,
  updateServiceBookingStatus,
} = require("../controllers/serviceBookingController");
const { writeLimiter } = require("../middleware/rateLimiter");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", writeLimiter, createServiceBooking);
router.get("/", protect, adminOnly, getServiceBookings);
router.patch("/:id/status", protect, adminOnly, updateServiceBookingStatus);

module.exports = router;
