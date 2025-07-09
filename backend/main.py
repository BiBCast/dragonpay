import os
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_restx import Api, Resource, fields
from werkzeug.security import generate_password_hash, check_password_hash

# --- App Setup ---
app = Flask(__name__)
CORS(app, origins=["http://localhost:4200"])
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=60)
app.config['DEBUG'] = True
jwt = JWTManager(app)

# --- Swagger / OpenAPI Setup ---
authorizations = {
    'BearerAuth': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': "Inserisci: **Bearer <JWT>**"
    }
}
api = Api(
    app,
    version='1.0',
    title='Mock Satispay API',
    description='API RESTful con Swagger UI per Satispay simulation',
    doc='/docs',
    authorizations=authorizations,
    security='BearerAuth'
)

# --- Models ---
login_model = api.model('Login', {
    'username': fields.String(required=True),
    'password': fields.String(required=True)
})


# --- Models (updated to match init.sql schema) ---
user_model = api.model('User', {
    'id': fields.Integer,
    'username': fields.String,
    'full_name': fields.String,
    'email': fields.String,
    'password_hash': fields.String,  # usually not sent to frontend
    'created_at': fields.String
})

account_model = api.model('Account', {
    'id': fields.String,
    'user_id': fields.Integer,
    'balance': fields.Float,
    'currency': fields.String,
    'created_at': fields.String
})

merchant_model = api.model('Merchant', {
    'id': fields.Integer,
    'name': fields.String,
    'merchant_code': fields.String,
    'created_at': fields.String
})

contact_model = api.model('Contact', {
    'id': fields.Integer,
    'owner_id': fields.Integer,
    'contact_id': fields.Integer,
    'nickname': fields.String,
    'added_at': fields.String
})

transaction_model = api.model('Transaction', {
    'id': fields.String,
    'account_id': fields.String,
    'amount': fields.Float,
    'currency': fields.String,
    'type': fields.String(enum=['payment','request','topup','payout','refund']),
    'status': fields.String(enum=['pending','completed','failed']),
    'related_id': fields.String,
    'description': fields.String,
    'created_at': fields.String
})

payment_request_model = api.model('PaymentRequest', {
    'id': fields.String,
    'requester_id': fields.Integer,
    'requestee_id': fields.Integer,
    'amount': fields.Float,
    'currency': fields.String,
    'message': fields.String,
    'status': fields.String(enum=['pending','accepted','declined','expired']),
    'created_at': fields.String,
    'expires_at': fields.String
})

# --- DB Helper ---
DB_PATH = './satispay.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    if app.debug:
        conn.set_trace_callback(lambda stmt: print(f"[SQL] {stmt}"))
    return conn

# --- Init DB ---
def init_db2():
    conn = get_db_connection()
    cur = conn.cursor()
    BASE = os.path.dirname(__file__)  # directory di backend/main.py

    init_sql = os.path.join(BASE, 'init.sql')
    with open(init_sql, 'r', encoding='utf-8') as f:
        sql = f.read()
    try:
        conn.execute('BEGIN')
        cur.executescript(sql)
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise
    finally:
        cur.execute("SELECT * FROM users")
        for user in cur.fetchall(): 
            pw_hash = generate_password_hash(user["username"])
            cur.execute("UPDATE  users SET password_hash = ? WHERE username = ?",
                        (pw_hash, user["username"]))
        conn.commit()
        conn.close()
    
    
init_db2()


# --- Namespaces ---
auth_ns = api.namespace('auth', description='Autenticazione')
wallet_ns = api.namespace('wallet', description='Gestione conto')
users_ns = api.namespace('users', description='Gestione utenti')
merch_ns = api.namespace('merchants', description='Gestione merchant')
contacts_ns = api.namespace('contacts', description='Gestione contatti')
tx_ns = api.namespace('transactions', description='Transazioni')
req_ns = api.namespace('requests', description='Payment requests')

# --- Auth ---
@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password') or ""
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        conn.close()
        print(f"[DEBUG] Login attempt for user: {username}")
        if row and check_password_hash(row['password_hash'], password):
            token = create_access_token(identity=str(row["id"]), expires_delta=timedelta(days=60))    
            return {'access_token': token}
        api.abort(401, 'Bad credentials')

# --- Current User ---
@users_ns.route('/me')
class CurrentUser(Resource):
    @jwt_required()
    @users_ns.marshal_with(user_model)
    def get(self):
        user_id = get_jwt_identity()
        conn = get_db_connection()
        row = conn.execute(
            "SELECT id, username, full_name, email, created_at FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        conn.close()
        if not row:
            api.abort(404, 'User not found')
        return row


@wallet_ns.route('/test')
class WalletTest(Resource):
    @jwt_required()
    @wallet_ns.doc(security='BearerAuth')
    @wallet_ns.marshal_with(account_model)
    def get(self):
        """Restituisce il conto dell'utente"""
       
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM accounts a JOIN users u"
            " ON a.user_id = u.id "
        )
        rows = cur.fetchall()
        conn.close()
        if not rows:
            api.abort(404, 'Account not found')
        return rows
# --- Wallet ---
@wallet_ns.route('')
class Wallet(Resource):
    @jwt_required()
    @wallet_ns.marshal_with(account_model)
    def get(self):
        user_id = get_jwt_identity()
        print(f"[DEBUG] Fetching accounts for user ID: {user_id}")
        conn = get_db_connection()
        rows = conn.execute("SELECT * FROM accounts WHERE user_id = ?", (user_id,)).fetchone()
        conn.close()
        return rows

@wallet_ns.route('/topup')
class TopUp(Resource):
    @jwt_required()
    @wallet_ns.expect(api.model('TopUpRequest', {
        'amount': fields.Float(required=True),
        'currency': fields.String(required=True)
    }))
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        amount = data.get('amount')
        currency = data.get('currency')
        print(f"[DEBUG] User ID: {user_id}, Amount: {amount}, Currency: {currency}")
        if not amount or amount <= 0:
            print(f"[DEBUG] Invalid top-up amount: {amount}")
            return {'message': 'Amount must be positive'}, 400
        if not currency:
            print("[DEBUG] Currency is required for top-up")
            return {'message': 'Currency is required'}, 400
        conn = get_db_connection()
        account = conn.execute("SELECT * FROM accounts WHERE user_id = ?", (user_id,)).fetchone()
        if not account:
            conn.close()
            return {'message': 'Account not found'}, 404
        new_balance = account['balance'] + amount
        conn.execute("UPDATE accounts SET balance = ? WHERE id = ?", (new_balance, account['id']))
        conn.commit()
        conn.close()
        return {'message': 'Top up successful', 'new_balance': new_balance}
# --- Merchants ---
@merch_ns.route('')
class MerchList(Resource):
    @jwt_required()
    @merch_ns.marshal_list_with(merchant_model)
    def get(self):
        conn = get_db_connection()
        rows = conn.execute("SELECT * FROM merchants").fetchall()
        conn.close()
        return rows

# --- Contacts ---
@contacts_ns.route('')
class ContactsList(Resource):
    @jwt_required()
    @contacts_ns.marshal_list_with(contact_model)
    def get(self):
        user_id = get_jwt_identity()
        conn = get_db_connection()
        rows = conn.execute("SELECT * FROM contacts WHERE owner_id = ?", (user_id,)).fetchall()
        conn.close()
        return rows

# --- Transactions ---
@tx_ns.route('')
class Transactions(Resource):
    @jwt_required()
    @tx_ns.marshal_list_with(transaction_model)
    def get(self):
        user_id = get_jwt_identity()
        conn = get_db_connection()
        acct = conn.execute("SELECT id FROM accounts WHERE user_id = ?", (user_id,)).fetchone()
        if not acct:
            api.abort(404, 'Account not found')
        rows = conn.execute(
            "SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC", (acct['id'],)
        ).fetchall()
        conn.close()
        return rows

# --- Payment Requests ---
@req_ns.route('')
class ReqList(Resource):
    @jwt_required()
    @req_ns.marshal_list_with(payment_request_model)
    def get(self):
        user_id = get_jwt_identity()
        conn = get_db_connection()
        rows = conn.execute(
            "SELECT * FROM payment_requests WHERE requester_id = ? OR requestee_id = ?",
            (user_id, user_id)
        ).fetchall()
        conn.close()
        return rows

# --- Health ---
@api.route('/hello')
class Hello(Resource):
    def get(self):
        return {'message': 'Hello, world!'}

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8000)
