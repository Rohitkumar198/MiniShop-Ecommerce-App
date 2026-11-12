
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://minishop-ecommerce-app.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB Connection Error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MiniShop API",
  });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

module.exports = app;
