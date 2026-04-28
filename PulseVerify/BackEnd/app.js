import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import detectionRoutes from "./routes/detectionRoutes.js";
import comparisonRoutes from "./routes/comparisonRoutes.js";

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://pulseverify-frontend-git-main-shnehasishdas18-9175s-projects.vercel.app',
    'https://pulseverify-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ── Body parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── Static uploads folder ───────────────────────────────────────────────────
// Serves files from BackEnd/uploads/ at http://localhost:5000/uploads/<filename>
// Real user uploads will be accessible here after multer saves them.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ success: true, message: "PulseVerify API is running.", timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/violations", detectionRoutes);
app.use("/api/comparisons", comparisonRoutes);

// ── 404 catch-all ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

export default app;
