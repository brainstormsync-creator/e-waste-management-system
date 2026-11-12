// Saves uploaded e-waste photos into backend/uploads
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `ewaste-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error("Only JPG, PNG or WEBP images are allowed."));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
