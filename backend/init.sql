-- init.sql
PRAGMA foreign_keys = ON;

-- Drop existing tables
DROP TABLE IF EXISTS payment_requests;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS merchants;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

-- Users: application users
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    full_name     TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW'))
);

-- Accounts (wallets) linked to users
CREATE TABLE IF NOT EXISTS accounts (
    id         TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL,
    balance    REAL NOT NULL DEFAULT 0.0,
    currency   TEXT NOT NULL DEFAULT 'EUR',
    created_at DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Merchants for business payments
CREATE TABLE IF NOT EXISTS merchants (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    merchant_code TEXT UNIQUE NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW'))
);

-- Contacts: peers a user can pay or request from
CREATE TABLE IF NOT EXISTS contacts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id   INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    nickname   TEXT,
    added_at   DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
    FOREIGN KEY(owner_id) REFERENCES users(id),
    FOREIGN KEY(contact_id) REFERENCES users(id),
    UNIQUE(owner_id, contact_id)
);

-- Transactions: record of money movement
CREATE TABLE IF NOT EXISTS transactions (
    id            TEXT PRIMARY KEY,
    account_id    TEXT NOT NULL,
    amount        REAL NOT NULL,
    currency      TEXT NOT NULL DEFAULT 'EUR',
    type          TEXT NOT NULL CHECK(type IN ('payment','request','topup','payout','refund')),
    status        TEXT NOT NULL CHECK(status IN ('pending','completed','failed')),
    related_id    TEXT,
    description   TEXT,
    created_at    DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
    FOREIGN KEY(account_id) REFERENCES accounts(id)
);

-- Payment requests: user-to-user payment requests
CREATE TABLE IF NOT EXISTS payment_requests (
    id            TEXT PRIMARY KEY,
    requester_id  INTEGER NOT NULL,
    requestee_id  INTEGER NOT NULL,
    amount        REAL NOT NULL,
    currency      TEXT NOT NULL DEFAULT 'EUR',
    message       TEXT,
    status        TEXT NOT NULL CHECK(status IN ('pending','accepted','declined','expired')),
    created_at    DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
    expires_at    DATETIME,
    FOREIGN KEY(requester_id) REFERENCES users(id),
    FOREIGN KEY(requestee_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user    ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_account        ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_req_requester     ON payment_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_req_requestee     ON payment_requests(requestee_id);

-- Seed default users (password_hash placeholders to be replaced in code)
INSERT INTO users (username, full_name, email, password_hash, created_at)
VALUES
  ('alice', 'Alice Rossi', 'alice@example.com', 'HASH1', '2025-07-01T10:00:00Z'),
  ('mario', 'Mario Rossi', 'mario@example.com', 'HASH2', '2025-07-01T10:05:00Z'),
  ('luca',  'Luca Bianchi','luca@example.com',  'HASH3', '2025-07-01T10:10:00Z');

-- Seed accounts
INSERT INTO accounts (id, user_id, balance, currency, created_at)
VALUES
  ('WALLET-alice', 1, 1200.50, 'EUR', '2025-07-01T10:00:00Z'),
  ('WALLET-mario', 2,  850.00, 'EUR', '2025-07-01T10:05:00Z'),
  ('WALLET-luca',  3, 2000.00, 'EUR', '2025-07-01T10:10:00Z');

-- Seed merchants
INSERT INTO merchants (name, merchant_code, created_at)
VALUES
  ('Bookstore Milano',    'MERCH-BOOK-001', '2025-06-30T09:00:00Z'),
  ('Pizzeria Napoli',     'MERCH-PIZZA-002','2025-06-30T09:15:00Z'),
  ('Supermercato Roma',   'MERCH-SUPER-003','2025-06-30T09:30:00Z');

-- Seed contacts (alice ↔ mario, alice ↔ luca)
INSERT INTO contacts (owner_id, contact_id, nickname, added_at)
VALUES
  (1, 2, 'Bro Mario', '2025-07-01T11:00:00Z'),
  (1, 3, 'Buddy Luca','2025-07-01T11:05:00Z'),
  (2, 1, 'Sis Alice', '2025-07-01T11:10:00Z');

-- Seed transactions
INSERT INTO transactions (id, account_id, amount, currency, type, status, related_id, description, created_at)
VALUES
  ('TXN-001', 'WALLET-alice', -45.00, 'EUR', 'payment', 'completed', 'MERCH-BOOK-001', 'Bought novels', '2025-07-01T12:00:00Z'),
  ('TXN-002', 'WALLET-mario', -12.50, 'EUR', 'payment', 'completed', 'MERCH-PIZZA-002','Lunch pizza','2025-07-01T12:30:00Z'),
  ('TXN-003', 'WALLET-luca', +500.00, 'EUR', 'topup',   'completed', NULL,             'Salary',    '2025-07-01T08:00:00Z'),
  ('TXN-004', 'WALLET-alice', -20.00, 'EUR', 'request', 'pending',  'REQ-001',         'Dinner share','2025-07-01T13:00:00Z');

-- Seed payment requests
INSERT INTO payment_requests (id, requester_id, requestee_id, amount, currency, message, status, created_at, expires_at)
VALUES
  ('REQ-001', 1, 2, 20.00, 'EUR', 'Share dinner cost', 'pending', '2025-07-01T13:00:00Z', '2025-07-08T13:00:00Z'),
  ('REQ-002', 3, 1, 15.75, 'EUR', 'Coffee treat',     'accepted','2025-07-01T14:00:00Z','2025-07-08T14:00:00Z');
