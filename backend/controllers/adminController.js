const EwasteRequest = require("../models/EwasteRequest");
const { STATUSES } = require("../models/EwasteRequest");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/admin/stats
exports.getStats = asyncHandler(async (req, res) => {
  const byStatus = await EwasteRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const stats = { total: 0, users: await User.countDocuments({ role: "user" }) };
  STATUSES.forEach((s) => (stats[s] = 0));
  byStatus.forEach((row) => { stats[row._id] = row.count; stats.total += row.count; });
  res.json({ stats });
});

// GET /api/admin/requests?status=pending
exports.getAllRequests = asyncHandler(async (req, res) => {
  const filter = STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
  const requests = await EwasteRequest.find(filter)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });
  res.json({ requests });
});

// PATCH /api/admin/requests/:id/status
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  if (!STATUSES.includes(status)) { res.status(400); throw new Error("Invalid status."); }

  const doc = await EwasteRequest.findById(req.params.id);
  if (!doc) { res.status(404); throw new Error("Request not found."); }

  doc.status = status;
  if (typeof adminNote === "string") doc.adminNote = adminNote.trim();
  await doc.save();
  res.json({ message: "Status updated.", request: doc });
});

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
  res.json({ users });
});
