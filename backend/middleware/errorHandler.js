// 404 handler — for any route not matched above
exports.notFound = (req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Centralized error handler — catches errors passed via next(err) or thrown in async
// routes wrapped with asyncHandler. Keeps error response shape consistent everywhere.
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);

  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Server error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already in use` : "Duplicate value";
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

// Wraps an async controller so rejected promises are forwarded to errorHandler
// instead of needing a try/catch in every function.
exports.asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
