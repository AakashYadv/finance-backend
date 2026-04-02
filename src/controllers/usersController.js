const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { run, get, all } = require("../models/database");
const { validateUser, handleValidation } = require("../middleware/validate");

const safe = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, created_at: u.created_at });

function listUsers(req, res) {
  const { role, status } = req.query;
  let sql = "SELECT * FROM users WHERE 1=1";
  const params = [];
  if (role) { sql += " AND role = ?"; params.push(role); }
  if (status) { sql += " AND status = ?"; params.push(status); }
  sql += " ORDER BY created_at DESC";
  res.json({ data: all(sql, params).map(safe) });
}

function getUser(req, res) {
  const user = get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(safe(user));
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  const errors = validateUser({ name, email, password, role });
  if (handleValidation(errors, res)) return;

  if (get("SELECT id FROM users WHERE email = ?", [email.toLowerCase()])) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const id = uuidv4();
  const now = new Date().toISOString();
  const password_hash = await bcrypt.hash(password, 10);
  run(
    "INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, name.trim(), email.toLowerCase(), password_hash, role, now, now]
  );
  res.status(201).json({ message: "User created", user: safe(get("SELECT * FROM users WHERE id = ?", [id])) });
}

async function updateUser(req, res) {
  const user = get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { name, email, password, role, status } = req.body;
  const errors = validateUser({ name, email, role, status }, true);
  if (handleValidation(errors, res)) return;

  if (email && email.toLowerCase() !== user.email) {
    const exists = get("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (exists && exists.id !== user.id) return res.status(409).json({ error: "Email already in use" });
  }

  const now = new Date().toISOString();
  const updates = { updated_at: now };
  if (name) updates.name = name.trim();
  if (email) updates.email = email.toLowerCase();
  if (role) updates.role = role;
  if (status) updates.status = status;
  if (password) updates.password_hash = await bcrypt.hash(password, 10);

  const keys = Object.keys(updates);
  if (keys.length === 1) return res.status(400).json({ error: "No fields to update" });

  const setClauses = keys.map((k) => `${k} = ?`).join(", ");
  run(`UPDATE users SET ${setClauses} WHERE id = ?`, [...Object.values(updates), user.id]);
  res.json({ message: "User updated", user: safe(get("SELECT * FROM users WHERE id = ?", [user.id])) });
}

function deleteUser(req, res) {
  const user = get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.id === req.user.id) return res.status(400).json({ error: "Cannot deactivate your own account" });
  run("UPDATE users SET status = 'inactive', updated_at = ? WHERE id = ?", [new Date().toISOString(), user.id]);
  res.json({ message: "User deactivated" });
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
