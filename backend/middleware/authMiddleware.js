const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the Bearer token and attaches { id, role } to req.user
exports.protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm the user still exists (in case they were deleted after the token was issued)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: "Not authorized, user no longer exists" });
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Not authorized, invalid or expired token" });
  }
};

// Use after `protect` — restricts a route to admin/supervisor accounts only
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }
  next();
};
