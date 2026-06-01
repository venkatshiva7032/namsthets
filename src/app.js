const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const path    = require("path");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── Security & logging middleware ─────────────────────────────
// Disable CSP so we can load assets from CDNs (Google Fonts, Chart.js, etc.)
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(morgan("dev"));
app.use(express.json());

// Serve static frontend assets from public directory
app.use(express.static(path.join(__dirname, "../public")));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/leads", require("./routes/leadRoutes"));

// ── Health check & Root ─────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ── Error handler (must be last) ──────────────────────────────
app.use(errorHandler);

module.exports = app;