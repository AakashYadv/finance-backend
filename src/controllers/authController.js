const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { run, get } = require("../models/database");
const { JWT_SECRET } = require("../middleware/auth");
const { validateUser, handleValidation } = require("../middleware/validate");

async function register(req, res) {
  const { name, email, password, role } = req.body;
  const errors = validateUser({ name, email, password, role });
  if (handleValidation(errors, res)) return;

  if (get("SELECT id FROM users WHERE email = ?", [email.toLowerCase()])) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const id = uuidv4();
  const password_hash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  run(
    "INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, name.trim(), email.toLowerCase(), password_hash, role, now, now]
  );

  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ message: "Registered successfully", token, user: { id, name, email, role } });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const user = get("SELECT * FROM users WHERE email = ? AND status = 'active'", [email.toLowerCase()]);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

function me(req, res) {
  const { id, name, email, role, status, created_at } = req.user;
  res.json({ id, name, email, role, status, created_at });
}

module.exports = { register, login, me };
