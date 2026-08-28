const mongoose = require("mongoose");

// One shared schema used by all 5 frontend pillars.
// The "category" field decides which pillar/page a vehicle belongs to:
//   "luxury"     -> luxury-rentals (Hussain Ali)
//   "economy"    -> economy-rentals (Muhammad Hamza)
//   "used-car"   -> used-car-dealership (Zahid Jamil)
//   "workshop"   -> auto-workshop services (Raja Mustafa)
//   "commercial" -> commercial-fleet (Muhammad Huzaifa Faizan)
const vehicleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["luxury", "economy", "used-car", "workshop", "commercial"],
    },
    brand: String,
    type: String, // e.g. Sedan, SUV, Hatchback, Convertible
    price: { type: Number, required: true },
    priceUnit: { type: String, default: "day" }, // "day", "month", "fixed" (for used-car sale price)
    transmission: String, // Automatic / Manual
    fuelType: String,
    seats: Number,
    image: String,
    description: String,
    features: [String], // e.g. ["AC", "GPS", "Chauffeur Included"]

    // Fields mainly used by used-car-dealership pillar
    year: Number,
    mileage: Number,
    condition: String, // "New", "Used - Excellent", etc.
    isVerified: { type: Boolean, default: false },

    // Fields mainly used by auto-workshop pillar
    serviceType: String, // e.g. "Engine Diagnostics", "Ceramic Coating"
    durationMinutes: Number,

    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
