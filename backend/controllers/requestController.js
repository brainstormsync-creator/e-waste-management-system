
const fs = require("fs");
const path = require("path");
const EwasteRequest = require("../models/EwasteRequest");
const { CATEGORIES, CONDITIONS } = require("../models/EwasteRequest");
const { asyncHandler } = require("../middleware/errorHandler");

const removeImage = (file) => {
  if (!file) return;
  fs.unlink(path.join(__dirname, "..", "uploads", file), () => {});
};

// POST /api/requests  (multipart/form-data)
exports.createRequest = asyncHandler(async (req, res) => {
  const { category, itemName, condition, description, address, pickupDate } = req.body;
  const quantity = Number(req.body.quantity);
  const image = req.file ? req.file.filename : "";

  const fail = (msg) => { removeImage(image); res.status(400); throw new Error(msg); };

  if (!CATEGORIES.includes(category)) fail("Please choose a valid category.");
  if (!itemName || itemName.trim().length < 2) fail("Enter the item name.");
  if (!Number.isInteger(quantity) || quantity < 1) fail("Quantity must be at least 1.");
  if (!CONDITIONS.includes(condition)) fail("Please choose the item condition.");
  if (!address || address.trim().length < 10) fail("Enter a full pickup address (at least 10 characters).");

  const date = new Date(pickupDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(date) || date < today) fail("Choose a pickup date from today onward.");

  const doc = await EwasteRequest.create({
    user: req.user._id,
    category,
    itemName: itemName.trim(),
    quantity,
    condition,
    description: (description || "").trim(),
    image,
    address: address.trim(),
    pickupDate: date,
  });
  res.status(201).json({ message: "Request submitted successfully.", request: doc });
});

// GET /api/requests/my
exports.getMyRequests = asyncHandler(async (req, res) => {
  const requests = await EwasteRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ requests });
});

// GET /api/requests/:id  (owner or admin)
exports.getRequestById = asyncHandler(async (req, res) => {
  const doc = await EwasteRequest.findById(req.params.id).populate("user", "name email phone");
  if (!doc) { res.status(404); throw new Error("Request not found."); }

  const ownerId = (doc.user._id || doc.user).toString();
  if (req.user.role !== "admin" && ownerId !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You cannot view this request.");
  }
  res.json({ request: doc });
});

// DELETE /api/requests/:id  (owner, only while pending)
exports.cancelRequest = asyncHandler(async (req, res) => {
  const doc = await EwasteRequest.findById(req.params.id);
  if (!doc) { res.status(404); throw new Error("Request not found."); }
  if (doc.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Not your request."); }
  if (doc.status !== "pending") { res.status(400); throw new Error("Only pending requests can be cancelled."); }

  removeImage(doc.image);
  await doc.deleteOne();
  res.json({ message: "Request cancelled." });
});
