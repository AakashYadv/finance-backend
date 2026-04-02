/**
 * Seed script - run with: node src/utils/seed.js
 * Creates 3 demo users and 60 sample financial records.
 */

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { getDb, run, get } = require("../models/database");

const CATEGORIES = ["Salary", "Freelance", "Investment", "Rent", "Utilities", "Food", "Travel", "Healthcare", "Marketing", "Equipment"];

function randomDate() {
  const start = new Date("2025-01-01");
  const end = new Date();
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split("T")[0];
}

async function seed() {
  await getDb(); // ensure DB is initialized

  console.log("🌱 Seeding database...\n");

  // Clear existing data
  run("DELETE FROM financial_records");
  run("DELETE FROM users");

  const users = [
    { name: "Admin User",    email: "admin@finance.dev",   password: "admin123",   role: "admin"   },
    { name: "Analyst Alice", email: "analyst@finance.dev", password: "analyst123", role: "analyst" },
    { name: "Viewer Bob",    email: "viewer@finance.dev",  password: "viewer123",  role: "viewer"  },
  ];

  let adminId;
  for (const u of users) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const hash = await bcrypt.hash(u.password, 10);
    run(
      "INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, u.name, u.email, hash, u.role, now, now]
    );
    if (u.role === "admin") adminId = id;
    console.log(`  ✅ ${u.role.padEnd(8)} → ${u.email}  /  password: ${u.password}`);
  }

  for (let i = 0; i < 60; i++) {
    const type = Math.random() > 0.45 ? "expense" : "income";
    const amount = parseFloat((Math.random() * 4900 + 100).toFixed(2));
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const date = randomDate();
    const now = new Date().toISOString();
    run(
      "INSERT INTO financial_records (id, amount, type, category, date, notes, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [uuidv4(), amount, type, category, date, `${type} – ${category}`, adminId, now, now]
    );
  }

  console.log("\n  ✅ 60 sample financial records created");
  console.log("\n✨ Done! Run the server with: npm start\n");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
