# 💸 SplitEase

A full-stack group expense tracker with real-time settlement, built with React, Node.js, and PostgreSQL.

Split expenses with friends, track who owes what, and settle up in as few
transfers as possible — all with live updates over WebSockets.

## Features

- **Group Management** — Create groups, add/remove members
- **Expense Tracking** — Equal, exact-amount, and percentage splits, plus a
  cash/UPI/card/bank payment method stored on every expense and settlement
- **Debt Simplification** — Greedy algorithm minimises the number of
  transactions needed to settle all debts
- **Real-time Updates** — Socket.IO broadcasts expense and settlement changes
  to everyone in the group; on serverless hosts the client transparently
  falls back to polling so groups still feel live
- **UPI payments** — Generate a UPI QR code and deep link to pay a balance
- **Email + password auth** — Registration/login with bcrypt hashing, JWTs,
  and rate-limited login attempts
- **Phone-friendly UI** — iOS Safari and Android Chrome get safe-area insets,
  password-manager autofill, 16px form fields (no focus zoom), bottom-sheet
  modals, and a phone-first responsive layout

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router 6, Vite      |
| Backend   | Node.js, Express, Socket.IO (with automatic polling fallback) |
| Database  | PostgreSQL (Neon free tier)         |
| Auth      | bcryptjs + JWT                      |
| Deploy    | Vercel (frontend + API), Neon (DB)  |

All services are on free tiers — see [DEPLOY.md](./DEPLOY.md).

**Live:** frontend at <https://splitease-red.vercel.app>, API at
<https://splitease-api-gamma.vercel.app>.

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. a free [Neon](https://neon.com) project)

### Setup

```bash
git clone <repo-url>
cd splitease

# Install all dependencies
npm run install:all

# Configure the database
cp backend/.env.example backend/.env
#   DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
#   JWT_SECRET=<any long random string>

# Start development servers (API :5000, frontend :5173)
npm run dev
```

Schema migrations and seed data run **automatically** the first time the API
boots, so there is no manual schema step. To run them by hand:

```bash
npm run db:migrate
npm run db:seed
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
| GET    | /api/health                     | Health check               |

## Tests

```bash
npm test --prefix backend -- --testPathIgnorePatterns api.test   # pure unit tests
npm test --prefix backend                                        # needs DATABASE_URL
```

## Debt Simplification Algorithm

The core algorithm (`backend/src/utils/simplifyDebts.js`) uses a **greedy
matching** approach:

1. Calculate net balances: `balance = total_paid - total_owed`
2. Separate into creditors (positive) and debtors (negative)
3. Match the largest debtor with the largest creditor
4. Transfer `min(|debtor|, creditor|)` between them
5. Repeat until all balances are zero

This reduces the number of transfers from potentially O(n²) down to O(n).

## Deployment

Follow **[DEPLOY.md](./DEPLOY.md)** — the live setup is Vercel frontend +
Vercel serverless API + Neon PostgreSQL, all on free tiers ($0/month).
There is also a single-service Render fallback described at the end of that
guide.
