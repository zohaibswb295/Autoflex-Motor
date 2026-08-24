const ServiceBooking = require("../models/ServiceBooking");
const Vehicle = require("../models/Vehicle");
const { asyncHandler } = require("../middleware/errorHandler");

// POST /api/service-booking
exports.createServiceBooking = asyncHandler(async (req, res) => {
  const { service, customerName, email, phone } = req.body;

  // ---- validation ----
  const errors = [];
  if (!service) errors.push("service (workshop vehicle/service id) is required");
  if (!customerName) errors.push("customerName is required");
  if (!email) errors.push("email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email is invalid");
  if (!phone) errors.push("phone is required");

  if (errors.length) {
    return res.status(400).json({ success: false, error: errors.join(", ") });
  }

  const serviceExists = await Vehicle.findOne({ _id: service, category: "workshop" });
  if (!serviceExists) {
    return res.status(404).json({ success: false, error: "Workshop service not found" });
  }

  const booking = await ServiceBooking.create(req.body);
  res.status(201).json({ success: true, data: booking });
});

// GET /api/service-booking (admin use)
exports.getServiceBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const bookings = await ServiceBooking.find(filter).populate("service").sort({ createdAt: -1 });
  res.json({ success: true, count: bookings.length, data: bookings });
});

// PATCH /api/service-booking/:id/status (admin use)
exports.updateServiceBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "confirmed", "in-progress", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, error: `status must be one of: ${allowed.join(", ")}` });
  }

  const booking = await ServiceBooking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!booking) {
    return res.status(404).json({ success: false, error: "Service booking not found" });
  }
  res.json({ success: true, data: booking });
});
