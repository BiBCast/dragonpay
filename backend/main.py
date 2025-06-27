# backend/main.py
#Bearer WQwNzFmIiwiZXhwIjoxNzUxMDEzNjk1fQ...
import os
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_restx import Api, Resource, fields
from werkzeug.security import generate_password_hash, check_password_hash

# --- App Setup ---
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
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
    doc='/docs',  # Swagger UI path
    authorizations=authorizations,
    security='BearerAuth'
)

# --- Models for Swagger ---
login_model = api.model('Login', {
    'username': fields.String(required=True, description="Username dell'utente"),
    'password': fields.String(required=True, description='Password in chiaro')
})
account_model = api.model('Account', {
    'id': fields.String(description='ID del conto'),
    'holder': fields.String(description='Nome del titolare'),
    'balance': fields.Float(description='Saldo attuale')
})
transaction_model = api.model('Transaction', {
    'id': fields.String(description='ID operazione'),
    'date': fields.String(description='Timestamp ISO della transazione'),
    'amount': fields.Float(description='Importo'),
    'description': fields.String(description='Descrizione')
})
transfer_model = api.model('Transfer', {
    'to_account': fields.String(required=True, description='Account di destinazione'),
    'amount': fields.Float(required=True, description='Importo del bonifico')
})
transfer_response = api.inherit('TransferResponse', transfer_model, {
    'status': fields.String(description='Status operazione'),
    'transaction': fields.Nested(transaction_model),
    'new_balance': fields.Float(description='Nuovo saldo')
})

# --- Database helper ---
DB_PATH = './satispay.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn



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
            user_id = user["id"]
            acct_id = f'WALLET-{user["username"]}-{user_id}'
            cur.execute("INSERT INTO accounts (id, holder, balance, user_id) VALUES (?, ?, ?, ?)",
                        (acct_id, user["full_name"], 1000.0, user_id))
        conn.commit()
        conn.close()
    
    
init_db2()

# --- Namespaces ---
auth_ns = api.namespace('auth', description='Autenticazione')
wallet_ns = api.namespace('wallet', description='Gestione conto')
tx_ns = api.namespace('transactions', description='Transazioni')

# --- Auth Endpoints ---
@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    @auth_ns.response(200, 'Success', model=api.model('Token', {'access_token': fields.String()}))
    @auth_ns.response(401, 'Unauthorized')
    def post(self):
        """Login e genera JWT"""
        data = request.get_json()
        if not data:
            api.abort(400, 'Missing JSON in request')
        username = data.get('username')
        password = data.get('password')
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = ?", (username,))
        row = cur.fetchone()
        conn.close()
        if row and check_password_hash(row['password_hash'], password):
            token = create_access_token(identity=username)
            return {'access_token': token}, 200
        api.abort(401, 'Bad username or password')

# --- Wallet Endpoints ---
@wallet_ns.route('')
class Wallet(Resource):
    @jwt_required()
    @wallet_ns.doc(security='BearerAuth')
    @wallet_ns.marshal_with(account_model)
    def get(self):
        """Restituisce il conto dell'utente"""
        user = get_jwt_identity()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT a.id, a.holder, a.balance FROM accounts a JOIN users u"
            " ON a.user_id = u.id WHERE u.username = ?", (user,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            api.abort(404, 'Account not found')
        return {'id': row['id'], 'holder': row['holder'], 'balance': row['balance']}

# --- Transactions Endpoints ---
@tx_ns.route('')
class Transactions(Resource):
    @jwt_required()
    @tx_ns.doc(security='BearerAuth')
    @tx_ns.marshal_list_with(transaction_model)
    def get(self):
        """Elenco transazioni dell'utente"""
        user = get_jwt_identity()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT a.id FROM accounts a JOIN users u ON a.user_id = u.id WHERE u.username = ?", (user,)
        )
        acct = cur.fetchone()
        if not acct:
            conn.close()
            api.abort(404, 'Account not found')
        cur.execute(
            "SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC", (acct['id'],)
        )
        rows = cur.fetchall()
        conn.close()
        return [{'id': r['id'], 'date': r['date'], 'amount': r['amount'], 'description': r['description']} for r in rows]

@tx_ns.route('/transfer')
class Transfer(Resource):
    @jwt_required()
    @tx_ns.doc(security='BearerAuth')
    @tx_ns.expect(transfer_model)
    @tx_ns.marshal_with(transfer_response)
    def post(self):
        """Esegue un bonifico interno"""
        data = request.get_json()
        if not data:
            api.abort(400, 'Missing JSON in request')
        to_acc = data.get('to_account')
        amount = data.get('amount')
        if amount is None or amount <= 0:
            api.abort(400, 'Invalid amount')
        user = get_jwt_identity()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT a.id, a.balance FROM accounts a JOIN users u ON a.user_id = u.id WHERE u.username = ?", (user,)
        )
        acct = cur.fetchone()
        if not acct or amount > acct['balance']:
            conn.close()
            api.abort(400, 'Insufficient balance')
        new_bal = acct['balance'] - amount
        cur.execute("UPDATE accounts SET balance = ? WHERE id = ?", (new_bal, acct['id']))
        tx_id = str(uuid.uuid4())
        date = datetime.now(timezone.utc).isoformat()
        cur.execute(
            "INSERT INTO transactions (id, date, amount, description, account_id) VALUES (?, ?, ?, ?, ?)",
            (tx_id, date, -amount, f'P2P to {to_acc}', acct['id'])
        )
        conn.commit()
        conn.close()
        return {
            'status': 'success',
            'transaction': {'id': tx_id, 'date': date, 'amount': -amount, 'description': f'P2P to {to_acc}'},
            'new_balance': new_bal
        }

# --- Health Endpoint ---
@api.route('/hello')
class Hello(Resource):
    def get(self):
        """Endpoint di health-check"""
        return {'message': 'Hello, world!'}

# --- Run Server ---
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8000)
