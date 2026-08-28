const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    pickupDate: Date,
    returnDate: Date,
    pickupLocation: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
