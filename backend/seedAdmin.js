// Creates the first admin account:  npm run seed:admin
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase();

  if (await User.findOne({ email })) {
    console.log("ℹ️  Admin already exists:", email);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || "Site Admin",
      email,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });
    console.log("✅ Admin created:", email);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
