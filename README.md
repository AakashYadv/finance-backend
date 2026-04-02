# 💰 Finance Data Processing and Access Control Backend

A RESTful API backend for a finance dashboard system built with **Node.js**, **Express**, and **SQLite**. Features JWT authentication, role-based access control, financial record management, and dashboard analytics.

---

## 🛠 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Runtime | Node.js | Fast, lightweight, great ecosystem |
| Framework | Express.js | Minimal and flexible REST framework |
| Database | SQLite (sql.js) | Zero-config, file-based, no build tools needed |
| Auth | JWT (jsonwebtoken) | Stateless, easy to test |
| Passwords | bcryptjs | Industry-standard hashing |
| Rate Limiting | express-rate-limit | Protection against brute-force |

---

## 📁 Project Structure

```
finance-backend/
├── src/
│   ├── index.js                    # Entry point, Express app setup
│   ├── controllers/
│   │   ├── authController.js       # Register, login, current user
│   │   ├── usersController.js      # User CRUD operations
│   │   ├── recordsController.js    # Financial records CRUD
│   │   └── dashboardController.js  # Analytics and summary APIs
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication + role authorization
│   │   └── validate.js             # Input validation helpers
│   ├── models/
│   │   └── database.js             # SQLite connection and schema
│   ├── routes/
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── users.js                # /api/users/*
│   │   ├── records.js              # /api/records/*
│   │   └── dashboard.js            # /api/dashboard/*
│   └── utils/
│       └── seed.js                 # Demo data seeder
├── data/                           # SQLite database (auto-created)
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AakashYadv/finance-backend.git
cd finance-backend

# 2. Install dependencies
npm install

# 3. Seed the database with demo data
node src/utils/seed.js

# 4. Start the server
npm start
```

Server runs at **http://localhost:3000**

For development with auto-reload:
```bash
npm run dev
```

---

## 👥 Roles and Permissions

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View dashboard & analytics | ✅ | ✅ | ✅ |
| View financial records | ✅ | ✅ | ✅ |
| Create financial records | ❌ | ✅ | ✅ |
| Update financial records | ❌ | ❌ | ✅ |
| Delete financial records | ❌ | ❌ | ✅ |
| View users list | ❌ | ✅ | ✅ |
| Create / update users | ❌ | ❌ | ✅ |
| Deactivate users | ❌ | ❌ | ✅ |

---

## 🔐 Demo Credentials

After running the seed script:

| Role | Email | Password |
|---|---|---|
| Admin | admin@finance.dev | admin123 |
| Analyst | analyst@finance.dev | analyst123 |
| Viewer | viewer@finance.dev | viewer123 |

---

## 📡 API Reference

All protected routes require this header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔑 Auth

#### Register
```
POST /api/auth/register
```
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "viewer"
}
```

#### Login
```
POST /api/auth/login
```
```json
{
  "email": "admin@finance.dev",
  "password": "admin123"
}
```
Returns a `token` — use this in all subsequent requests as a Bearer token.

#### Get Current User
```
GET /api/auth/me
```

---

### 📊 Dashboard Analytics

#### Financial Summary
```
GET /api/dashboard/summary?from=2025-01-01&to=2025-12-31
```
Returns total income, total expenses, net balance and counts.

**Sample Response:**
```json
{
  "total_income": 45230.50,
  "total_expenses": 28190.75,
  "net_balance": 17039.75,
  "income_count": 27,
  "expense_count": 33
}
```

#### Category Breakdown
```
GET /api/dashboard/category-breakdown?type=expense
```

#### Monthly Trends
```
GET /api/dashboard/monthly-trends?year=2025
```

#### Weekly Trends
```
GET /api/dashboard/weekly-trends?weeks=8
```

#### Recent Activity
```
GET /api/dashboard/recent-activity?limit=10
```

---

### 📁 Financial Records

#### List Records
```
GET /api/records
```
Supports filters:
| Query Param | Example | Description |
|---|---|---|
| type | `?type=expense` | Filter by income or expense |
| category | `?category=Food` | Filter by category name |
| from | `?from=2025-01-01` | Start date filter |
| to | `?to=2025-12-31` | End date filter |
| search | `?search=rent` | Search in notes and category |
| page | `?page=2` | Page number |
| limit | `?limit=10` | Records per page |

#### Get Single Record
```
GET /api/records/:id
```

#### Create Record
```
POST /api/records
```
```json
{
  "amount": 1500.00,
  "type": "expense",
  "category": "Rent",
  "date": "2025-06-01",
  "notes": "Monthly office rent"
}
```

#### Update Record
```
PATCH /api/records/:id
```
```json
{
  "amount": 1600.00,
  "notes": "Rent increased"
}
```

#### Delete Record (soft delete)
```
DELETE /api/records/:id
```

---

### 👤 Users

#### List Users
```
GET /api/users?role=analyst&status=active
```

#### Get User
```
GET /api/users/:id
```

#### Create User
```
POST /api/users
```
```json
{
  "name": "New Analyst",
  "email": "analyst2@example.com",
  "password": "pass1234",
  "role": "analyst"
}
```

#### Update User
```
PATCH /api/users/:id
```
```json
{
  "role": "admin",
  "status": "inactive"
}
```

#### Deactivate User
```
DELETE /api/users/:id
```

---

## ⚠️ Error Format

All errors follow a consistent response shape:
```json
{
  "error": "Short description",
  "details": ["field-level messages if applicable"]
}
```

### HTTP Status Codes Used
| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation failed |
| 401 | Not authenticated |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Internal server error |

---

## 🧠 Design Decisions

### sql.js over better-sqlite3
Used `sql.js` (pure JavaScript SQLite) instead of `better-sqlite3` to avoid requiring Visual Studio C++ build tools on Windows. Works on any machine with just Node.js installed.

### Soft Deletes
Both users and records use soft deletes (`is_deleted` flag, `status = inactive`). This preserves audit history, which is critical in financial systems.

### Role Hierarchy
Analysts can create records but not update or delete them. Only admins control the full data lifecycle. This reflects a real-world pattern where analysts handle data entry but admins govern data integrity.

### JWT Authentication
Tokens expire in 7 days. Auth middleware validates the token and checks the user is still active on every request.

### Rate Limiting
Global limit of 200 requests per 15 minutes. Auth endpoints are stricter at 20 requests per 15 minutes to prevent brute-force attacks.

### No Separate Permissions Table
Three roles (viewer, analyst, admin) cleanly cover all requirements. A dynamic permissions table would be over-engineering for this scope.

---

## ✅ Features Checklist

- [x] User registration and login with JWT
- [x] Role-based access control (viewer, analyst, admin)
- [x] User status management (active / inactive)
- [x] Financial records CRUD (income & expense)
- [x] Soft delete for records and users
- [x] Filtering by type, category, date range, search
- [x] Pagination on record listing
- [x] Dashboard summary (income, expenses, net balance)
- [x] Category breakdown analytics
- [x] Monthly and weekly trend analytics
- [x] Recent activity feed
- [x] Input validation with descriptive error messages
- [x] Rate limiting on all routes
- [x] Consistent error response format

---

## 📬 Contact

**Aakash Yadav**
aky47bolt@gmail.com
