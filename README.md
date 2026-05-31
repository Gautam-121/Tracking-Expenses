# SplitEase — Backend

REST API for a Splitwise-inspired expense sharing application. Built with Node.js, Express, Sequelize, and PostgreSQL.

## Tech Stack

- **Runtime** — Node.js (ESM)
- **Framework** — Express.js v5
- **Database** — PostgreSQL via Sequelize ORM
- **Validation** — Zod v4
- **Migrations** — Umzug
- **Security** — Helmet, CORS, HPP, Compression

## Project Structure

```
src/
├── config/          # Database, env, umzug (migrations)
├── controllers/     # Request handlers
├── middlewares/     # Error handler, request validation
├── migrations/      # Database migration files
├── models/          # Sequelize models
├── routes/          # Express route definitions
├── services/        # Business logic
├── utils/           # ApiError, ApiResponse, constants
└── validations/     # Zod schemas
```

## API Endpoints

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/groups` | Create a new group |
| GET | `/api/v1/groups/:code` | Get group by code |

### Participants
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/groups/:code/participants` | Add a participant |
| GET | `/api/v1/groups/:code/participants` | Get all participants |
| PATCH | `/api/v1/groups/:code/participants/:id` | Rename a participant |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/groups/:code/expenses` | Create an expense |
| GET | `/api/v1/groups/:code/expenses` | Get all expenses |
| DELETE | `/api/v1/groups/:code/expenses/:expenseId` | Delete an expense |
| GET | `/api/v1/groups/:code/expenses/balances` | Get balances |
| GET | `/api/v1/groups/:code/expenses/settlements` | Get optimized settlements |

## Core Logic

### Split Types
- **Equal** — Amount divided equally among all participants. Last participant absorbs rounding remainder to avoid penny errors.
- **Unequal** — Custom share per participant. Validated that shares sum exactly to total amount.

### Balance Calculation
Each expense updates balances as:
- Payer receives `+totalAmount`
- Each participant receives `-shareAmount`

Net balance across all expenses shows who owes whom.

### Settlement Optimization
Uses a **greedy algorithm**:
1. Compute net balance for every participant
2. Sort creditors (positive balance) and debtors (negative balance) by amount
3. Always match the biggest debtor with the biggest creditor
4. This minimizes the total number of transactions required

### Edge Cases Handled
- Payer must be in the participants list
- Shares must sum exactly to total amount
- All participants must belong to the group
- Duplicate participant names blocked per group
- Decimal precision via `Math.round(value * 100) / 100`

## Environment Variables

```env
NODE_ENV=development
PORT=4001
CORS_ORIGIN=*

DATABASE_URL=postgresql://user:password@host:5432/dbname
DB_SSL=false
DB_RUN_MIGRATIONS_ON_BOOT=false

DB_POOL_MAX=10
DB_POOL_MIN=2
```

## Local Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## Scripts

```bash
npm run dev          # Start with file watching
npm run start        # Production start
npm run migrate      # Run pending migrations
npm run migrate:undo # Rollback last migration
npm run migrate:status # Show migration status
```
