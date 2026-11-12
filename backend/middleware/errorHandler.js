// Wraps async controllers so errors reach errorHandler (Express 4 needs this)
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Unknown API route
function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

// Central error handler: always answers with { message }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format.";
  } else if (err.code === 11000) {
    status = 409;
    message = "That email is already registered.";
  } else if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller." : err.message;
  } else if (message.startsWith("Only JPG")) {
    status = 400;
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
}

module.exports = { asyncHandler, notFound, errorHandler };
