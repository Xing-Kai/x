import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import orderRoutes from "./routes/order.route.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found"
//   });
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  connectDB();
});

// Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });