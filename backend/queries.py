# backend/queries.py
import sqlite3
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = './satispay.db'

# ----- DB Connection -----
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ----- Initialization -----
def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            holder TEXT NOT NULL,
            balance REAL NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            account_id TEXT NOT NULL,
            FOREIGN KEY(account_id) REFERENCES accounts(id)
        )
    ''')

    # create default user and account
    cur.execute("SELECT * FROM users WHERE username = ?", ('alice',))
    if cur.fetchone() is None:
        pw_hash = generate_password_hash('secret')
        cur.execute(
            "INSERT INTO users (username, full_name, password_hash) VALUES (?, ?, ?)",
            ('alice', 'Alice Rossi', pw_hash)
        )
        user_id = cur.lastrowid
        acct_id = 'WALLET-ALICE-001'
        cur.execute(
            "INSERT INTO accounts (id, holder, balance, user_id) VALUES (?, ?, ?, ?)",
            (acct_id, 'Alice Rossi', 1000.0, user_id)
        )
    conn.commit()
    conn.close()

# ----- Query Functions -----
def get_user_by_username(username):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()
    return row


def create_user(username, full_name, password):
    pw_hash = generate_password_hash(password)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (username, full_name, password_hash) VALUES (?, ?, ?)",
        (username, full_name, pw_hash)
    )
    conn.commit()
    user_id = cur.lastrowid
    conn.close()
    return user_id


def get_account_by_username(username):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT a.id, a.holder, a.balance, a.user_id "
        "FROM accounts a JOIN users u ON a.user_id = u.id WHERE u.username = ?",
        (username,)
    )
    row = cur.fetchone()
    conn.close()
    return row


def get_transactions(account_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC",
        (account_id,)
    )
    rows = cur.fetchall()
    conn.close()
    return rows


def update_balance(account_id, new_balance):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE accounts SET balance = ? WHERE id = ?",
        (new_balance, account_id)
    )
    conn.commit()
    conn.close()


def insert_transaction(account_id, amount, description):
    tx_id = str(uuid.uuid4())
    date = datetime.utcnow().isoformat()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO transactions (id, date, amount, description, account_id) VALUES (?, ?, ?, ?, ?)",
        (tx_id, date, amount, description, account_id)
    )
    conn.commit()
    conn.close()
    return {'id': tx_id, 'date': date, 'amount': amount, 'description': description}


# Ensure DB initialized
init_db()
