# Finance Backend

A backend API for a finance dashboard system. Built as part of an internship assignment.

## Stack

- Node.js + Express
- SQLite (via sql.js)
- JWT for authentication
- bcryptjs for password hashing

## Setup

```bash
npm install
node src/utils/seed.js
npm start
```

Server runs at `http://localhost:3000`

## Demo Users

| Role | Email | Password |
|---|---|---|
| Admin | admin@finance.dev | admin123 |
| Analyst | analyst@finance.dev | analyst123 |
| Viewer | viewer@finance.dev | viewer123 |

## Project Structure

```
src/
├── controllers/   # route logic
├── middleware/    # auth + validation
├── models/        # database setup
├── routes/        # API routes
└── utils/         # seed script
```

## API Endpoints

All protected routes need `Authorization: Bearer <token>` header.

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me`

**Records**
- `GET    /api/records` — supports `?type=`, `?category=`, `?from=`, `?to=`, `?search=`
- `GET    /api/records/:id`
- `POST   /api/records` — analyst, admin only
- `PATCH  /api/records/:id` — admin only
- `DELETE /api/records/:id` — admin only (soft delete)

**Dashboard**
- `GET /api/dashboard/summary`
- `GET /api/dashboard/category-breakdown`
- `GET /api/dashboard/monthly-trends`
- `GET /api/dashboard/weekly-trends`
- `GET /api/dashboard/recent-activity`

**Users**
- `GET    /api/users` — admin, analyst
- `POST   /api/users` — admin only
- `PATCH  /api/users/:id` — admin only
- `DELETE /api/users/:id` — admin only

## Roles

- **Viewer** — can only view records and dashboard
- **Analyst** — can view and create records
- **Admin** — full access

## Notes

I used `sql.js` instead of `better-sqlite3` because the latter requires C++ build tools on Windows which caused issues during setup. Records and users are soft deleted so data is preserved.
