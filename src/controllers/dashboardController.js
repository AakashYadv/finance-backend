const { all, get } = require("../models/database");

function getSummary(req, res) {
  const { from, to } = req.query;
  let where = "WHERE is_deleted = 0";
  const params = [];
  if (from) { where += " AND date >= ?"; params.push(from); }
  if (to) { where += " AND date <= ?"; params.push(to); }

  const rows = all(`SELECT type, SUM(amount) as total, COUNT(*) as count FROM financial_records ${where} GROUP BY type`, params);
  const income = rows.find((r) => r.type === "income") || { total: 0, count: 0 };
  const expense = rows.find((r) => r.type === "expense") || { total: 0, count: 0 };

  res.json({
    total_income: income.total || 0,
    total_expenses: expense.total || 0,
    net_balance: (income.total || 0) - (expense.total || 0),
    income_count: income.count || 0,
    expense_count: expense.count || 0,
    filters: { from: from || null, to: to || null },
  });
}

function getCategoryBreakdown(req, res) {
  const { from, to, type } = req.query;
  let where = "WHERE is_deleted = 0";
  const params = [];
  if (type) { where += " AND type = ?"; params.push(type); }
  if (from) { where += " AND date >= ?"; params.push(from); }
  if (to) { where += " AND date <= ?"; params.push(to); }

  const data = all(
    `SELECT category, type, SUM(amount) as total, COUNT(*) as count FROM financial_records ${where} GROUP BY category, type ORDER BY total DESC`,
    params
  );
  res.json({ data });
}

function getMonthlyTrends(req, res) {
  const { year } = req.query;
  let where = "WHERE is_deleted = 0";
  const params = [];
  if (year) { where += " AND strftime('%Y', date) = ?"; params.push(String(year)); }

  const rows = all(
    `SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total FROM financial_records ${where} GROUP BY strftime('%Y-%m', date), type ORDER BY month ASC`,
    params
  );

  // Pivot into month -> { income, expenses, net }
  const map = {};
  for (const row of rows) {
    if (!map[row.month]) map[row.month] = { month: row.month, income: 0, expenses: 0, net: 0 };
    if (row.type === "income") map[row.month].income = row.total;
    else map[row.month].expenses = row.total;
  }
  const data = Object.values(map).map((m) => ({ ...m, net: m.income - m.expenses }));
  res.json({ data });
}

function getWeeklyTrends(req, res) {
  const weeks = Math.min(parseInt(req.query.weeks) || 8, 52);
  // Calculate cutoff date
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const rows = all(
    `SELECT strftime('%Y-W%W', date) as week, type, SUM(amount) as total FROM financial_records
     WHERE is_deleted = 0 AND date >= ? GROUP BY strftime('%Y-W%W', date), type ORDER BY week DESC`,
    [cutoffStr]
  );

  const map = {};
  for (const row of rows) {
    if (!map[row.week]) map[row.week] = { week: row.week, income: 0, expenses: 0, net: 0 };
    if (row.type === "income") map[row.week].income = row.total;
    else map[row.week].expenses = row.total;
  }
  const data = Object.values(map).map((m) => ({ ...m, net: m.income - m.expenses }));
  res.json({ data });
}

function getRecentActivity(req, res) {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const data = all(
    `SELECT r.*, u.name as created_by_name FROM financial_records r
     LEFT JOIN users u ON r.created_by = u.id WHERE r.is_deleted = 0
     ORDER BY r.created_at DESC LIMIT ?`,
    [limit]
  );
  res.json({ data });
}

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getWeeklyTrends, getRecentActivity };
