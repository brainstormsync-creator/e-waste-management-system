const mongoose = require("mongoose");

const CATEGORIES = [
  "Mobiles & Tablets",
  "Computers & Laptops",
  "Batteries",
  "TVs & Monitors",
  "Home Appliances",
  "Cables & Accessories",
];
const CONDITIONS = ["Working", "Not Working", "Damaged"];
const STATUSES = ["pending", "approved", "collected", "recycled", "rejected"];

const requestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    itemName: { type: String, required: true, trim: true, maxlength: 100 },
    quantity: { type: Number, required: true, min: 1, max: 1000 },
    condition: { type: String, enum: CONDITIONS, required: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    image: { type: String, default: "" }, // file name inside /uploads
    address: { type: String, required: true, trim: true, maxlength: 300 },
    pickupDate: { type: Date, required: true },
    status: { type: String, enum: STATUSES, default: "pending" },
    adminNote: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EwasteRequest", requestSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.CONDITIONS = CONDITIONS;
module.exports.STATUSES = STATUSES;
