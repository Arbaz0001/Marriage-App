import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const PROD_ORIGIN = "https://marriage.sspurm.org";

app.set("trust proxy", 1);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || origin === PROD_ORIGIN) {
      return callback(null, true);
    }

    return callback(new Error("CORS Not Allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.post("/webhook", express.json({ type: "*/*" }), (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Webhook received",
    event: req.get("x-github-event") || "unknown",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Marriage App API Running",
  });
});

app.use((err, _req, res, _next) => {
  if (err?.message === "CORS Not Allowed") {
    return res.status(403).json({
      success: false,
      message: "CORS Not Allowed",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
