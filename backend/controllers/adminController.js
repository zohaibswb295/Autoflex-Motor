const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");

// ---------- FLEET (Vehicles) ----------
async function getFleet(req, res) {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createVehicle(req, res) {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function updateVehicle(req, res) {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) return res.status(404).json({ success: false, error: "Vehicle not found" });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function deleteVehicle(req, res) {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: "Vehicle not found" });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ---------- RENTALS (Bookings) ----------
async function getRentals(req, res) {
  try {
    const bookings = await Booking.find().populate("vehicle", "title").sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateRentalStatus(req, res) {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  getFleet,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getRentals,
  updateRentalStatus,
};
