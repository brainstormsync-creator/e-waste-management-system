const router = require("express").Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const { createRequest, getMyRequests, getRequestById, cancelRequest } = require("../controllers/requestController");

router.use(protect);

router.post("/", upload.single("image"), createRequest);
router.get("/my", getMyRequests);
router.get("/:id", getRequestById);
router.delete("/:id", cancelRequest);

module.exports = router;
