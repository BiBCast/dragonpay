
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
    'id': fields.Integer,
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
    'id': fields.Integer,
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
    'id': fields.Integer,
    'requester_id': fields.Integer,
    'requestee_id': fields.Integer,
    'amount': fields.Float,
    'currency': fields.String,
    'message': fields.String,
    'status': fields.String(enum=['pending','accepted','declined','expired']),
    'created_at': fields.String,
    'expires_at': fields.String
})

user_brief = api.model('UserBrief', {
    'id': fields.Integer,
    'username': fields.String,
    'full_name': fields.String,
    'email': fields.String
})

request_with_user = api.model('PaymentRequestWithUser', {
    **payment_request_model,  # existing fields
    'other_user': fields.Nested(user_brief)  # nested metadata
})

decision_model = api.model('RequestDecision', {
  'id': fields.Integer(required=True),
  'action': fields.String(required=True, enum=['accept', 'decline'])
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
# --- Current User ---
@users_ns.route('')
class AllUsers(Resource):
    @jwt_required()
    @users_ns.marshal_list_with(user_model)
    def get(self):
        user_id = get_jwt_identity()
        conn = get_db_connection()
        row = conn.execute(
            "SELECT * FROM users "
        ).fetchall()
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
        # Update balance
        conn.execute("UPDATE accounts SET balance = ? WHERE id = ?", (new_balance, account['id']))
        # Create transaction record
        create_transaction(
            conn=conn,
            account_id=account['id'],
            amount=amount,
            currency=currency,
            tx_type='topup',
            status='completed',
            related_id=None,
            description='Wallet top-up'
        )
        conn.commit()
        conn.close()
        return {'message': 'Top up successful', 'new_balance': new_balance}
# --- Helper: Create Transaction ---
def create_transaction(conn, account_id, amount, currency, tx_type, status, related_id, description):
    tx_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        """
        INSERT INTO transactions ( account_id, amount, currency, type, status, related_id, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            
            account_id,
            amount,
            currency,
            tx_type,
            status,
            related_id,
            description,
            now
        )
    )
    return tx_id

# --- Send Money ---
@wallet_ns.route('/sendMoney')
class SendMoney(Resource):
    @jwt_required()
    @wallet_ns.expect(api.model('SendMoneyRequest', {
        'contact':  fields.String(required=True, description="Username, user ID or merchant code"),
        'amount':   fields.Float(required=True,  description="Amount to transfer"),
        'currency': fields.String(required=True,  description="Currency code")
    }))
    def post(self):
        """Transfer money from the authenticated user to another user or to a merchant."""
        user_id  = get_jwt_identity()
        data     = request.get_json() or {}
        contact  = data.get('contact')
        amount   = data.get('amount')
        currency = data.get('currency')

        # 1️⃣ Input validation
        if not contact or amount is None or amount <= 0 or not currency:
            return {'message': 'Invalid input data'}, 400

        db_path = os.path.join(os.path.dirname(__file__), 'satispay.db')
        conn    = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row

        try:
            conn.execute('BEGIN')

            # 2️⃣ Load sender and verify funds
            sender = conn.execute(
                "SELECT id, balance, currency FROM accounts WHERE user_id = ?",
                (user_id,)
            ).fetchone()
            
            sender_container = conn.execute(
                "SELECT * FROM users  WHERE id = ?",
                (user_id,)
            ).fetchone()
            if not sender:
                return {'message': 'Sender account not found'}, 404
            if sender['currency'] != currency:
                return {'message': 'Currency mismatch'}, 400
            if sender['balance'] < amount:
                return {'message': 'Insufficient funds'}, 400

            # 3️⃣ Try to resolve as user
            recipient_user = conn.execute(
                "SELECT u.id, a.id AS acct_id, a.balance, a.currency,u.full_name "
                "FROM users u JOIN accounts a ON a.user_id = u.id "
                "WHERE u.username = ? OR u.id = ?",
                (contact, contact)
            ).fetchone()

            if recipient_user:
                # Standard user-to-user transfer
                r_acct_id = recipient_user['acct_id']
                r_balance = recipient_user['balance']
                r_currency= recipient_user['currency']
                r_name    = recipient_user['full_name']

                if r_currency != currency:
                    return {'message': 'Recipient currency mismatch'}, 400

                # Update both sides
                new_sender_bal = sender['balance'] - amount
                new_recipient_bal = r_balance + amount
                conn.execute(
                    "UPDATE accounts SET balance = ? WHERE id = ?",
                    (new_sender_bal, sender['id'])
                )
                conn.execute(
                    "UPDATE accounts SET balance = ? WHERE id = ?",
                    (new_recipient_bal, r_acct_id)
                )

                # Record two transactions
                now_iso = datetime.now(timezone.utc).isoformat()
                tx1 = create_transaction(
                    conn, sender['id'], -amount, currency,
                    'payment', 'completed', None,
                    f"Sent to {r_name}"
                )
                tx2 = create_transaction(
                    conn, r_acct_id, amount, currency,
                    'payment', 'completed', tx1,
                    f"Received from {sender_container['full_name']}"  # Use full name of sender
                )
                # Link them
                conn.execute(
                    "UPDATE transactions SET related_id = ? WHERE id = ?",
                    (tx2, tx1)
                )

            else:
                # 4️⃣ Fallback: merchant
                merchant = conn.execute(
                    "SELECT id, name, merchant_code FROM merchants WHERE merchant_code = ?",
                    (contact,)
                ).fetchone()
                if not merchant:
                    return {'message': 'Recipient not found'}, 404

                # Debit only the sender
                new_sender_bal = sender['balance'] - amount
                conn.execute(
                    "UPDATE accounts SET balance = ? WHERE id = ?",
                    (new_sender_bal, sender['id'])
                )

                # Record single transaction pointing at merchant_code
                #now_iso = datetime.now(timezone.utc).isoformat()
                create_transaction(
                    conn,
                    sender['id'],
                    -amount,
                    currency,
                    'payment',
                    'completed',
                    merchant['merchant_code'],
                    f"Payment to merchant {merchant['name']}",
                    #now_iso
                )

            conn.commit()
            return {
                'message': 'Money sent successfully',
                'new_balance': new_sender_bal
            }, 200

        except Exception as e:
            conn.rollback()
            api.abort(500, f'Internal error: {e}')

        finally:
            conn.close()


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
    @req_ns.marshal_list_with(request_with_user)
    def get(self):
        user_id = int(get_jwt_identity())
        conn = get_db_connection()
        rows = conn.execute(
            """SELECT p.*, 
                      u.id   AS other_id,
                      u.username AS other_username, 
                      u.full_name AS other_full_name, 
                      u.email AS other_email
               FROM payment_requests p
               JOIN users u ON  u.id = p.requester_id
               WHERE p.requestee_id = ? 
            """, (user_id,)
        ).fetchall()
        conn.close()

        # Format each row to include nested 'other_user'
        output = []
        for r in rows:
            d = dict(r)
            d['other_user'] = {
                'id': d.pop('other_id'),
                'username': d.pop('other_username'),
                'full_name': d.pop('other_full_name'),
                'email': d.pop('other_email')
            }
            output.append(d)
        return output


@req_ns.route('/decision')
class ReqDecision(Resource):
    @jwt_required()
    @req_ns.expect(decision_model, validate=True)
    @req_ns.marshal_with(payment_request_model)
    def put(self):
        """
        Accept or decline a pending payment request.
        """
        print("[DEBUG] Processing payment request decision")
        data = request.get_json()
        user_id =  int(get_jwt_identity())
        req_id = int(data['id'])
        action = data['action']

        if action not in ('accept', 'decline'):
            api.abort(400, 'Action must be "accept" or "decline"')

        conn = get_db_connection()
        try:
            conn.execute('BEGIN')
            req = conn.execute(
                "SELECT * FROM payment_requests WHERE id = ?",
                (req_id,)
            ).fetchone()

            requester_user = conn.execute(
                            "SELECT * FROM users WHERE id = ?",
                            (req["requester_id"],)
                        ).fetchone()
            requester_account = conn.execute(
                            "SELECT * FROM accounts WHERE user_id = ?",
                            (req["requester_id"],)
                        ).fetchone()
            
            if not req:
                api.abort(404, 'Request not found or not for this user')
            if req['status'] != 'pending':
                api.abort(400, 'Request is not pending')

            if action == 'decline':
                conn.execute(
                    "UPDATE payment_requests SET status = 'declined' WHERE id = ?",
                    (req_id,)
                )
                conn.commit()
                req = dict(req)
                req['status'] = 'declined'
                return req

            # action == 'accept'
            # 1️⃣ Create transaction
            acct = conn.execute(
                "SELECT id, balance, currency FROM accounts WHERE user_id = ?",
                (user_id,)
            ).fetchone()
            if not acct or acct['balance'] < req['amount']:
                api.abort(400, 'Insufficient funds to accept request')

            new_balance = acct['balance'] - req['amount']
            conn.execute("UPDATE accounts SET balance = ? WHERE id = ?",
                         (new_balance, acct['id']))
            #io acct altro 
            tx1 = create_transaction(
                conn, acct['id'],
                -req['amount'],
                req['currency'],
                'payment',
                'completed',
                req_id,
                f"Payment for request {requester_user["full_name"]}"  # Use full name of user,
            )
            tx2 = create_transaction(
                    conn, requester_account["id"], req['amount'], req['currency'],
                    'payment', 'completed', tx1,
                    f"Payment for request {requester_user['full_name']}"  # Use full name of sender
            )
            # Link them
            conn.execute(
                "UPDATE transactions SET related_id = ? WHERE id = ?",
                (tx2, tx1)
            )
            # 2️⃣ Update status
            conn.execute(
                "UPDATE payment_requests SET status = 'accepted' WHERE id = ?",
                (req_id,)
            )
            conn.commit()

            req = dict(req)
            req['status'] = 'accepted'
            return req

        except Exception as e:
            conn.rollback()
            api.abort(500, f'Internal error: {e}')
        finally:
            conn.close()

@req_ns.route('/create')
class ReqCreate(Resource):
    @jwt_required()
    #@req_ns.expect(payment_request_model, validate=True)
    @req_ns.marshal_with(payment_request_model)
    def post(self):
        """
        Create a new payment request—current user is the requester.
        """
        data = request.get_json()
        user_id = get_jwt_identity()

        # pull fields out of the incoming JSON (all optional in the model)
        requestee_id = data.get('requestee_id')
        amount       = data.get('amount')
        currency     = data.get('currency')
        message      = data.get('message')
        expires_at   = data.get('expires_at')

        # basic validation
        if not requestee_id:
            api.abort(400, '`requestee_id` is required')
        if amount is None or amount <= 0:
            api.abort(400, '`amount` must be a positive number')
        if not currency:
            api.abort(400, '`currency` is required')

        conn = get_db_connection()
        try:
            conn.execute('BEGIN')

            # verify the requestee exists
            if not conn.execute("SELECT 1 FROM users WHERE id = ?", (requestee_id,)).fetchone():
                api.abort(404, 'Requestee not found')

            req_id = str(uuid.uuid4())
            now    = datetime.now(timezone.utc).isoformat()

            conn.execute("""
              INSERT INTO payment_requests
                ( requester_id, requestee_id, amount, currency, message, status, created_at, expires_at)
              VALUES ( ?, ?, ?, ?, ?, 'pending', ?, ?)
            """, ( user_id, requestee_id, amount, currency, message, now, expires_at))

            conn.commit()

            return {
                
                'requester_id': user_id,
                'requestee_id': requestee_id,
                'amount': amount,
                'currency': currency,
                'message': message,
                'status': 'pending',
                'created_at': now,
                'expires_at': expires_at
            }, 201

        except Exception as e:
            conn.rollback()
            api.abort(500, f'Internal error: {e}')
        finally:
            conn.close()

# --- Health ---
@api.route('/hello')
class Hello(Resource):
    def get(self):
        return {'message': 'Hello, world!'}

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8000)
