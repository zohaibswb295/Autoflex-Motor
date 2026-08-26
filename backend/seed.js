// Run this once with: node seed.js
// It fills your MongoDB with sample data for all 4 pillars so the frontend has something to show.

const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Vehicle = require("./models/Vehicle");

dotenv.config();

const sampleVehicles = [
  // Luxury rentals
  {
    title: "Mercedes S-Class",
    category: "luxury",
    brand: "Mercedes",
    type: "Sedan",
    price: 25000,
    priceUnit: "day",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    image: "img/cars/1.png",
    description: "VIP chauffeur-driven Mercedes S-Class, ideal for business and formal events.",
    features: ["Chauffeur Included", "AC", "Leather Seats"],
  },
  {
    title: "Range Rover Vogue",
    category: "luxury",
    brand: "Land Rover",
    type: "SUV",
    price: 35000,
    priceUnit: "day",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    image: "img/cars/2.png",
    description: "Premium SUV rental for weddings and airport transfers.",
    features: ["Chauffeur Included", "AC", "Wedding Decor Available"],
  },

  // Economy rentals
  {
    title: "Toyota Corolla",
    category: "economy",
    brand: "Toyota",
    type: "Sedan",
    price: 6000,
    priceUnit: "day",
    transmission: "Manual",
    fuelType: "Petrol",
    seats: 5,
    image: "img/cars/3.png",
    description: "Reliable self-drive sedan, perfect for daily commutes and city travel.",
    features: ["Self-Drive", "AC", "Fuel Efficient"],
  },
  {
    title: "Suzuki Cultus",
    category: "economy",
    brand: "Suzuki",
    type: "Hatchback",
    price: 4000,
    priceUnit: "day",
    transmission: "Manual",
    fuelType: "Petrol",
    seats: 5,
    image: "img/cars/4.png",
    description: "Budget-friendly hatchback available on monthly subscription.",
    features: ["Self-Drive", "Monthly Subscription Available"],
  },

  // Used car dealership
  {
    title: "Honda Civic 2019",
    category: "used-car",
    brand: "Honda",
    type: "Sedan",
    price: 4500000,
    priceUnit: "fixed",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    year: 2019,
    mileage: 45000,
    condition: "Used - Excellent",
    isVerified: true,
    image: "img/cars/5.png",
    description: "Verified used Honda Civic, single owner, full inspection report available.",
    features: ["Verified", "Inspection Report", "Warranty Available"],
  },

  // Auto workshop
  {
    title: "Engine Diagnostics & Tuning",
    category: "workshop",
    serviceType: "Engine Diagnostics",
    durationMinutes: 90,
    price: 3000,
    priceUnit: "fixed",
    image: "img/cars/6.png",
    description: "Complete computerized engine diagnostics and performance tuning.",
    features: ["Computerized Scan", "Performance Report"],
  },
  {
    title: "Ceramic Coating & Detailing",
    category: "workshop",
    serviceType: "Ceramic Coating",
    durationMinutes: 240,
    price: 15000,
    priceUnit: "fixed",
    image: "img/cars/7.png",
    description: "Premium ceramic coating with full interior and exterior detailing.",
    features: ["9H Ceramic Coating", "Interior Detailing"],
  },
];

const runSeed = async () => {
  await connectDB();
  try {
    await Vehicle.deleteMany();
    await Vehicle.insertMany(sampleVehicles);
    console.log("Sample data inserted successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

runSeed();
