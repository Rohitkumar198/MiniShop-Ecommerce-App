require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const createUser = async () => {
  const email = process.env.NEW_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.NEW_USER_PASSWORD;

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing from backend/.env");
  if (!email || !password) throw new Error("NEW_USER_EMAIL and NEW_USER_PASSWORD are required");
  if (password.length < 6) throw new Error("User password must be at least 6 characters");

  await mongoose.connect(process.env.MONGO_URI);
  const existingUser = await User.findOne({ email }).select("role");
  if (existingUser) {
    console.log(`Account already exists for ${email} (role: ${existingUser.role}); no changes made.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name: "User", email, password: hashedPassword, role: "user" });
  console.log(`Customer account is ready for ${email}.`);
};

createUser()
  .catch((error) => {
    console.error(`Could not create customer account: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
