const jwt = require("jsonwebtoken");
const { get } = require("../models/database");

const JWT_SECRET = process.env.JWT_SECRET || "finance_secret_key_change_in_prod";

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = get("SELECT * FROM users WHERE id = ? AND status = 'active'", [payload.id]);
    if (!user) return res.status(401).json({ error: "User not found or inactive" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize, JWT_SECRET };
