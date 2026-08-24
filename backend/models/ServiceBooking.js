const mongoose = require("mongoose");

// Used for the auto-workshop pillar: customers request a service (e.g. Engine
// Diagnostics, Ceramic Coating) rather than renting a vehicle.
const serviceBookingSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true }, // Vehicle doc with category "workshop"
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleModel: String, // the customer's own car, e.g. "Honda Civic 2019"
    preferredDate: Date,
    dropOffLocation: String,
    notes: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceBooking", serviceBookingSchema);
