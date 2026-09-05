# 💸 Splitwise

A full-stack group expense tracker with real-time settlement, built with React, Node.js, and PostgreSQL.

## Features

- **Group Management** — Create groups, add/remove members
- **Expense Tracking** — Add expenses with equal splits, see who paid what
- **Debt Simplification** — Greedy algorithm minimizes the number of transactions needed to settle all debts
- **Real-time Updates** — Socket.IO broadcasts expense and settlement changes to all group members
- **Settlement Recording** — Mark debts as paid and track settlement history
- **JWT Authentication** — Secure user registration and login

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router 6, Vite      |
| Backend   | Node.js, Express, Socket.IO         |
| Database  | PostgreSQL                          |
| Auth      | bcryptjs + JWT                      |
| Deploy    | Render (web services + managed DB)  |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or a hosted instance)

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd splitwise-clone

# Install all dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL

# Create database tables
npm run db:migrate

# Seed sample data (optional)
npm run db:seed

# Start development servers
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

### Demo Accounts

| Email                | Password     |
|----------------------|--------------|
| alice@example.com    | password123  |
| bob@example.com      | password123  |
| charlie@example.com  | password123  |
| diana@example.com    | password123  |

## API Endpoints

| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| POST   | /api/auth/register              | Register a new user        |
| POST   | /api/auth/login                 | Login                      |
| GET    | /api/auth/me                    | Get current user profile   |
| GET    | /api/auth/search?q=             | Search users               |
| GET    | /api/groups                     | List user's groups         |
| POST   | /api/groups                     | Create a group             |
| GET    | /api/groups/:id                 | Get group details          |
| POST   | /api/groups/:id/members         | Add member                 |
| DELETE | /api/groups/:id/members/:uid    | Remove member              |
| POST   | /api/expenses                   | Add an expense             |
| GET    | /api/expenses/group/:gid        | List group expenses        |
| GET    | /api/balances/:groupId          | Calculate balances         |
| POST   | /api/settlements                | Record a settlement        |
| GET    | /api/settlements/group/:gid     | List group settlements     |

## Debt Simplification Algorithm

The core algorithm (`backend/src/utils/simplifyDebts.js`) uses a **greedy matching** approach:

1. Calculate net balances: `balance = total_paid - total_owed`
2. Separate into creditors (positive) and debtors (negative)
3. Match the largest debtor with the largest creditor
4. Transfer `min(|debtor|, creditor)` between them
5. Repeat until all balances are zero

This minimizes the number of transactions from potentially O(n²) down to O(n).

## Deployment to Render

1. Push this repo to GitHub
2. Go to [Render](https://render.com) → New → Blueprint
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml` and provision:
   - Backend web service
   - Frontend static site
   - PostgreSQL database
5. Set the `FRONTEND_URL` env var on the backend service to your frontend URL
6. Run database migration on the backend:
   ```bash
   # SSH into the backend service or run via Render Shell
   node src/migrate.js
   ```
