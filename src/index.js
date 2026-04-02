const express = require("express");
const rateLimit = require("express-rate-limit");
const { getDb } = require("./models/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: "Too many requests" } }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: "Too many login attempts" } });

app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/records", require("./routes/records"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/api", (req, res) => {
  res.json({
    name: "Finance Backend API",
    version: "1.0.0",
    endpoints: {
      "POST /api/auth/register": "Register user",
      "POST /api/auth/login": "Login",
      "GET  /api/auth/me": "Current user",
      "GET  /api/users": "List users [admin, analyst]",
      "POST /api/users": "Create user [admin]",
      "GET  /api/records": "List records [all]",
      "POST /api/records": "Create record [analyst, admin]",
      "GET  /api/dashboard/summary": "Financial summary",
      "GET  /api/dashboard/category-breakdown": "By category",
      "GET  /api/dashboard/monthly-trends": "Monthly trends",
      "GET  /api/dashboard/weekly-trends": "Weekly trends",
      "GET  /api/dashboard/recent-activity": "Recent records",
    },
  });
});

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Initialize DB before starting server
getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Finance Backend running at http://localhost:${PORT}`);
    console.log(`📖 API index:  http://localhost:${PORT}/api`);
    console.log(`❤️  Health:    http://localhost:${PORT}/health\n`);
  });
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

module.exports = app;
