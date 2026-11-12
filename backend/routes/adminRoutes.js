const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const { getStats, getAllRequests, updateStatus, getUsers } = require("../controllers/adminController");

router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/requests", getAllRequests);
router.patch("/requests/:id/status", updateStatus);
router.get("/users", getUsers);

module.exports = router;

