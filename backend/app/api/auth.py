from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, SQLModel
from app.core.database import get_session
from app.models.user import User
from app.schemas.auth import UserCreate, UserRead, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user
from datetime import timedelta
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/signup", response_model=UserRead)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    logger.info(f"🔵 SIGNUP REQUEST - Email: {user.email}")
    existing_user = session.exec(select(User).where(User.email == user.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, password_hash=hashed_password, full_name=user.full_name, role=user.role)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    logger.info(f"🔵 LOGIN REQUEST - Username: {form_data.username}")
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

class UserUpdate(SQLModel):
    full_name: str | None = None
    password: str | None = None

@router.put("/me", response_model=UserRead)
def update_user_me(user_update: UserUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.password:
        current_user.password_hash = get_password_hash(user_update.password)
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.get("/stats")
def get_stats(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    logger.info(f"🔵 STATS REQUEST - User: {current_user.email}")
    from app.models.product import Product
    from app.models.inventory import StockMove
    
    total_products = session.exec(select(Product)).all()
    low_stock = len([p for p in total_products if p.current_stock < 10]) # Simple logic
    
    # Count moves - Fixed: use & operator for multiple conditions
    incoming = session.exec(
        select(StockMove).where(
            (StockMove.move_type == 'IN') & (StockMove.status == 'draft')
        )
    ).all()
    outgoing = session.exec(
        select(StockMove).where(
            (StockMove.move_type == 'OUT') & (StockMove.status == 'draft')
        )
    ).all()
    
    return {
        "total_products": len(total_products),
        "low_stock": low_stock,
        "incoming": len(incoming),
        "outgoing": len(outgoing)
    }
