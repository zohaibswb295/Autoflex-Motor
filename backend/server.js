const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter); // global rate limit on all API traffic

// Health check / test route
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Backend is running!" });
});

// ---- Auth (JWT registration/login/session) ----
app.use("/api/auth", require("./routes/authRoutes"));

// ---- Core API routes (original naming, kept for backward compatibility with the current frontend) ----
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));

// ---- Same routers re-mounted under the task-list naming (Fleet / Rentals) ----
app.use("/api/fleet", require("./routes/vehicleRoutes"));
app.use("/api/rentals", require("./routes/bookingRoutes"));

// ---- Service inquiries (auto-workshop pillar) ----
app.use("/api/service-booking", require("./routes/serviceBookingRoutes"));

// ---- Admin namespace (JWT + admin role required) ----
app.use("/api/admin", require("./routes/adminRoutes"));

// 404 handler (must come after all routes)
app.use(notFound);

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
