import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/User.js";
import sellerRoutes from "./routes/Seller.js";
import productRoutes from "./routes/product.js";
import connectCloudinary from "./config/cloudinary.js";
import cartRouter from "./routes/cartRoutes.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWebhooks } from "./controller/orderController.js";
configDotenv();
const app = express();
const PORT = process.env.PORT || 3000;

// Allow multiple origins
const allowedOrigins = ["http://localhost:5173", "https://green-store-j5kv.vercel.app/", "https://green-store-j5kv-l1pacpdcz-alis-projects-1ef90113.vercel.app/", "https://green-store-j5kv-git-main-alis-projects-1ef90113.vercel.app/"];

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// middleware

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// routes
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/orders", orderRouter); // I made MISTAKE here, it was so dumb to write it incorrect, ORDERS instead ORDERS

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Green Store API is running",
    environment: process.env.NODE_ENV || "development",
  });
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on Port: ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`);
    });
  })
  .catch((e) => {
    console.error("❌ Database connection failed:", e.message);
    process.exit(1);
  });

// Connect to Cloudinary
connectCloudinary()
  .then(() => {
    console.log("☁️  Cloudinary connected successfully!");
  })
  .catch((e) => {
    console.error(`❌ Cloudinary connection error: ${e.message}`);
  });
