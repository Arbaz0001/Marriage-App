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
const ALLOWED_ORIGINS = new Set([
  "https://marriage.sspurm.org",
  "http://localhost:3000",
  "http://localhost:5173",
]);

app.set("trust proxy", 1);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.has(origin)) {
      return callback(null, true);
    }

    console.error(`CORS origin not in allow list, allowing request: ${origin}`);
    return callback(null, true);
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
app.use("/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Marriage App API Running",
  });
});

app.use("/api", (_req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);

  return res.status(500).json({
    success: false,
    message: err?.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
