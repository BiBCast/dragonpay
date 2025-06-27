-- init.sql

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;  
DROP TABLE IF EXISTS transactions;
-- Create tables for users, accounts, and transactions

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    holder TEXT NOT NULL,
    balance REAL NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    account_id TEXT NOT NULL,
    FOREIGN KEY(account_id) REFERENCES accounts(id)
);

-- Insert default user 'alice' with password 'secret'
-- Nota: la password hash deve essere generata in Python e aggiornata qui
-- Ecco come ottenere la hash:
-- >>> from werkzeug.security import generate_password_hash
-- >>> print(generate_password_hash('secret'))
INSERT  INTO users ( username, full_name, password_hash)
VALUES ( 'alice', 'Alice Rossi', '1');

INSERT  INTO users ( username, full_name, password_hash)
VALUES ('mario', 'Mario Rossi', '1');



