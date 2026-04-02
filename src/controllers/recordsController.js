const { v4: uuidv4 } = require("uuid");
const { run, get, all } = require("../models/database");
const { validateRecord, handleValidation } = require("../middleware/validate");

function listRecords(req, res) {
  const { type, category, from, to, search, page = 1, limit = 20 } = req.query;
  let sql = `SELECT r.*, u.name as created_by_name FROM financial_records r
             LEFT JOIN users u ON r.created_by = u.id WHERE r.is_deleted = 0`;
  const params = [];

  if (type) { sql += " AND r.type = ?"; params.push(type); }
  if (category) { sql += " AND r.category LIKE ?"; params.push(`%${category}%`); }
  if (from) { sql += " AND r.date >= ?"; params.push(from); }
  if (to) { sql += " AND r.date <= ?"; params.push(to); }
  if (search) { sql += " AND (r.notes LIKE ? OR r.category LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }

  const allRows = all(sql + " ORDER BY r.date DESC", params);
  const total = allRows.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const data = allRows.slice(offset, offset + parseInt(limit));

  res.json({ data, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
}

function getRecord(req, res) {
  const record = get(
    `SELECT r.*, u.name as created_by_name FROM financial_records r
     LEFT JOIN users u ON r.created_by = u.id WHERE r.id = ? AND r.is_deleted = 0`,
    [req.params.id]
  );
  if (!record) return res.status(404).json({ error: "Record not found" });
  res.json(record);
}

function createRecord(req, res) {
  const { amount, type, category, date, notes } = req.body;
  const errors = validateRecord({ amount, type, category, date });
  if (handleValidation(errors, res)) return;

  const id = uuidv4();
  const now = new Date().toISOString();
  run(
    "INSERT INTO financial_records (id, amount, type, category, date, notes, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, parseFloat(amount), type, category.trim(), date, notes || null, req.user.id, now, now]
  );
  res.status(201).json({ message: "Record created", record: get("SELECT * FROM financial_records WHERE id = ?", [id]) });
}

function updateRecord(req, res) {
  const record = get("SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0", [req.params.id]);
  if (!record) return res.status(404).json({ error: "Record not found" });

  const { amount, type, category, date, notes } = req.body;
  const errors = validateRecord({ amount, type, date }, true);
  if (handleValidation(errors, res)) return;

  const now = new Date().toISOString();
  const updates = { updated_at: now };
  if (amount !== undefined) updates.amount = parseFloat(amount);
  if (type !== undefined) updates.type = type;
  if (category !== undefined) updates.category = category.trim();
  if (date !== undefined) updates.date = date;
  if (notes !== undefined) updates.notes = notes;

  const keys = Object.keys(updates);
  if (keys.length === 1) return res.status(400).json({ error: "No fields to update" });

  const setClauses = keys.map((k) => `${k} = ?`).join(", ");
  run(`UPDATE financial_records SET ${setClauses} WHERE id = ?`, [...Object.values(updates), record.id]);
  res.json({ message: "Record updated", record: get("SELECT * FROM financial_records WHERE id = ?", [record.id]) });
}

function deleteRecord(req, res) {
  const record = get("SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0", [req.params.id]);
  if (!record) return res.status(404).json({ error: "Record not found" });
  run("UPDATE financial_records SET is_deleted = 1, updated_at = ? WHERE id = ?", [new Date().toISOString(), record.id]);
  res.json({ message: "Record deleted" });
}

module.exports = { listRecords, getRecord, createRecord, updateRecord, deleteRecord };
