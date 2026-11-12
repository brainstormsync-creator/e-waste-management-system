const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorHandler");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role });

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const phone = (req.body.phone || "").trim();
  const password = req.body.password || "";

  if (name.length < 3) { res.status(400); throw new Error("Name must be at least 3 characters."); }
  if (!EMAIL_RE.test(email)) { res.status(400); throw new Error("Please enter a valid email address."); }
if (phone && !/^[0-9+\-\s]{10,15}$/.test(phone)) { res.status(400); throw new Error("Enter a valid phone number."); }
  if (password.length < 6) { res.status(400); throw new Error("Password must be at least 6 characters."); }

  if (await User.findOne({ email })) { res.status(409); throw new Error("That email is already registered."); }

  // role is never taken from the request, so nobody can self-register as admin
  const user = await User.create({ name, email, phone, password });
  res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Incorrect email or password.");
  }
  res.json({ token: signToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
