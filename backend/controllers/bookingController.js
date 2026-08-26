const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { vehicle } = req.body;

    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
      return res.status(404).json({ success: false, error: "Vehicle not found" });
    }

    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// GET /api/bookings (admin use)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("vehicle").sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/bookings/:id/status (admin use - confirm/cancel)
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
