require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing from backend/.env");
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  if (password.length < 6) throw new Error("Admin password must be at least 6 characters");

  await mongoose.connect(process.env.MONGO_URI);
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    {
      $set: { email, password: hashedPassword, role: "admin" },
      $setOnInsert: { name: "Admin" }
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin account is ready for ${email}.`);
};

createAdmin()
  .catch((error) => {
    console.error(`Could not create admin account: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
