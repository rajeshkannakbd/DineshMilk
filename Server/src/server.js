import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import customerRoutes from "./routes/customerRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import occasionalRoutes from "./routes/occasionalRoutes.js";
import boothRoutes from "./routes/boothRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MilkFlow API is running",
  });
});

app.use("/api/customers", customerRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/occasional-sales", occasionalRoutes);
app.use("/api/booth-sales", boothRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
