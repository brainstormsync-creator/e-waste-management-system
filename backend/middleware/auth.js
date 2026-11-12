const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler } = require("./errorHandler");

// Requires a valid "Authorization: Bearer <token>" header
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    res.status(401);
    throw new Error("Please log in to continue.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Session expired. Please log in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error("Account no longer exists.");
  }
  req.user = user;
  next();
});

// Allows only administrators (use after protect)
function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  res.status(403);
  next(new Error("Admin access only."));
}

module.exports = { protect, adminOnly };
