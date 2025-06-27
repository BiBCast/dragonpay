# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import uuid

from sqlalchemy import create_engine, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker, Session

# --- JWT config ---
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# --- Database setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./satispay.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# --- SQLAlchemy Base ---
class Base(DeclarativeBase):
    pass

# --- ORM models ---
class UserDB(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(nullable=False, unique=True)
    full_name: Mapped[str] = mapped_column(nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    account: Mapped["AccountDB"] = relationship(back_populates="owner", uselist=False)

class AccountDB(Base):
    __tablename__ = "accounts"
    id: Mapped[str] = mapped_column(primary_key=True)
    holder: Mapped[str] = mapped_column(nullable=False)
    balance: Mapped[float] = mapped_column(nullable=False, default=0.0)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    owner: Mapped[UserDB] = relationship(back_populates="account")
    transactions: Mapped[List["TransactionDB"]] = relationship(back_populates="account")

class TransactionDB(Base):
    __tablename__ = "transactions"
    id: Mapped[str] = mapped_column(primary_key=True)
    date: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)
    amount: Mapped[float] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=True)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    account: Mapped[AccountDB] = relationship(back_populates="transactions")

Base.metadata.create_all(bind=engine)

# --- Pydantic schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class Account(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    holder: str
    balance: float

class Transaction(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    date: datetime
    amount: float
    description: Optional[str] = None

class TransferRequest(BaseModel):
    to_account: str
    amount: float

class TransferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status: str
    transaction: Transaction
    new_balance: float

# --- App init ---
app = FastAPI(title="Mock Satispay Backend", version="1.2.0")

# --- DB dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Auth utils ---
def verify_password(plain: str, hashed: str) -> bool:
    return plain == hashed  # sostituire con hashing reale

def get_user(db: Session, username: str) -> Optional[UserDB]:
    return db.query(UserDB).filter(UserDB.username == username).first()

def authenticate_user(db: Session, username: str, password: str) -> Optional[UserDB]:
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserDB:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exc
    except JWTError:
        raise credentials_exc
    user = get_user(db, username)
    if user is None:
        raise credentials_exc
    return user

# --- Create default data ---
def init_db():
    db = SessionLocal()
    if not get_user(db, "alice"):
        usr = UserDB(username="alice", full_name="Alice Rossi", hashed_password="secret")
        db.add(usr)
        db.commit()
        db.refresh(usr)
        acct = AccountDB(id="WALLET-ALICE-001", holder=usr.full_name, balance=1000.0, owner_id=usr.id)
        db.add(acct)
        db.commit()
    db.close()

init_db()

# --- Auth endpoint ---
@app.post("/token", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer"}

# --- API endpoints ---
@app.get("/api/wallet", response_model=Account)
async def read_wallet(user: UserDB = Depends(get_current_user)):
    return user.account

@app.get("/api/wallet/transactions", response_model=List[Transaction])
async def read_transactions(user: UserDB = Depends(get_current_user)):
    return user.account.transactions

@app.post("/api/wallet/transfer", response_model=TransferResponse)
async def create_transfer(req: TransferRequest, user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    acct = user.account
    if req.amount <= 0 or req.amount > acct.balance:
        raise HTTPException(status_code=400, detail="Invalid amount or insufficient balance")
    acct.balance -= req.amount
    tx = TransactionDB(id=str(uuid.uuid4()), date=datetime.utcnow(), amount=-req.amount,
                      description=f"P2P transfer to {req.to_account}", account_id=acct.id)
    db.add(tx); db.commit(); db.refresh(tx)
    tx_schema = Transaction.model_validate(tx)
    return TransferResponse(status="success", transaction=tx_schema, new_balance=acct.balance)
