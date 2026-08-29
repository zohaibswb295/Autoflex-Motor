const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Root route - test the base URL
app.get("/", (req, res) => {
  res.json({ success: true, message: "Autoflex Motor backend is live!" });
});

// Health check / test route
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Backend is running!" });
});

// Core API routes
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));

// Admin panel routes (login + protected fleet/rentals management)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

// Local development ke liye listen karo, Vercel par nahi
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Vercel ke liye app export karna zaroori hai
module.exports = app;
