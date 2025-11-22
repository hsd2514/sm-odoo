from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, SQLModel
from typing import Optional
from app.core.database import get_session
from app.models.user import User
from app.schemas.auth import UserCreate, UserRead, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user
from datetime import timedelta, datetime
from app.core.config import settings
from app.core.email import send_otp_email
from app.models.otp import OTP
import logging
import random
import string

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
def get_stats(
    move_type: Optional[str] = None,
    status: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    category: Optional[str] = None,
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    """Get dashboard stats with optional filters"""
    logger.info(f"🔵 STATS REQUEST - User: {current_user.email}")
    from app.models.product import Product
    from app.models.inventory import StockMove, Warehouse
    
    # Get products with optional category filter
    from app.models.category import Category
    product_query = select(Product)
    if category:
        # Try to find category by name first (for backward compatibility)
        cat = session.exec(select(Category).where(Category.name == category)).first()
        if cat:
            product_query = product_query.where(Product.category_id == cat.id)
        else:
            # Fallback to old category field
            product_query = product_query.where(Product.category == category)
    total_products = session.exec(product_query).all()
    # Count products below minimum stock level (or < 10 if no min_stock_level set)
    low_stock = len([
        p for p in total_products 
        if (p.min_stock_level is not None and p.current_stock < p.min_stock_level) or 
           (p.min_stock_level is None and p.current_stock < 10)
    ])
    
    # Count moves with filters
    incoming_query = select(StockMove).where(StockMove.move_type == 'IN')
    outgoing_query = select(StockMove).where(StockMove.move_type == 'OUT')
    
    if status:
        incoming_query = incoming_query.where(StockMove.status == status)
        outgoing_query = outgoing_query.where(StockMove.status == status)
    else:
        # Default: count draft moves
        incoming_query = incoming_query.where(StockMove.status == 'draft')
        outgoing_query = outgoing_query.where(StockMove.status == 'draft')
    
    if warehouse_id:
        incoming_query = incoming_query.where(
            (StockMove.dest_warehouse_id == warehouse_id) | 
            (StockMove.source_warehouse_id == warehouse_id)
        )
        outgoing_query = outgoing_query.where(
            (StockMove.source_warehouse_id == warehouse_id) |
            (StockMove.dest_warehouse_id == warehouse_id)
        )
    
    incoming = session.exec(incoming_query).all()
    outgoing = session.exec(outgoing_query).all()
    
    # Get additional stats
    internal_transfers = session.exec(
        select(StockMove).where(StockMove.move_type == 'INT')
    ).all()
    adjustments = session.exec(
        select(StockMove).where(StockMove.move_type == 'ADJ')
    ).all()
    
    return {
        "total_products": len(total_products),
        "low_stock": low_stock,
        "incoming": len(incoming),
        "outgoing": len(outgoing),
        "internal_transfers": len(internal_transfers),
        "adjustments": len(adjustments)
    }

@router.post("/forgot-password")
def request_password_reset(email: str = Query(..., description="User email address"), session: Session = Depends(get_session)):
    """Request password reset OTP"""
    logger.info(f"🔵 PASSWORD RESET REQUEST - Email: {email}")
    
    # Check if user exists
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        # Don't reveal if user exists or not (security best practice)
        return {"message": "If the email exists, an OTP has been sent"}
    
    # Generate 6-digit OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    
    # Invalidate any existing unused OTPs for this email
    existing_otps = session.exec(
        select(OTP).where(
            (OTP.email == email) & 
            (OTP.used == False) &
            (OTP.expires_at > datetime.utcnow())
        )
    ).all()
    for otp in existing_otps:
        otp.used = True
        session.add(otp)
    
    # Create new OTP (expires in 10 minutes)
    new_otp = OTP(
        email=email,
        otp_code=otp_code,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        used=False
    )
    session.add(new_otp)
    session.commit()
    
    # Send email
    if send_otp_email(email, otp_code):
        return {"message": "If the email exists, an OTP has been sent"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send OTP email. Please check SMTP configuration.")

@router.post("/verify-otp")
def verify_otp(
    email: str = Query(..., description="User email address"),
    otp_code: str = Query(..., description="6-digit OTP code"),
    session: Session = Depends(get_session)
):
    """Verify OTP code (doesn't mark as used - that happens in reset-password)"""
    logger.info(f"🔵 OTP VERIFICATION - Email: {email}")
    
    otp = session.exec(
        select(OTP).where(
            (OTP.email == email) &
            (OTP.otp_code == otp_code) &
            (OTP.used == False) &
            (OTP.expires_at > datetime.utcnow())
        )
    ).first()
    
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Don't mark as used here - let reset-password do that
    # This allows the user to verify and then reset in separate steps
    
    return {"message": "OTP verified successfully", "verified": True}

@router.post("/reset-password")
def reset_password(
    email: str = Query(..., description="User email address"),
    otp_code: str = Query(..., description="6-digit OTP code"),
    new_password: str = Query(..., description="New password (min 8 characters)"),
    session: Session = Depends(get_session)
):
    """Reset password after OTP verification"""
    logger.info(f"🔵 PASSWORD RESET - Email: {email}")
    
    # Verify OTP first
    otp = session.exec(
        select(OTP).where(
            (OTP.email == email) &
            (OTP.otp_code == otp_code) &
            (OTP.used == False) &
            (OTP.expires_at > datetime.utcnow())
        )
    ).first()
    
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Get user
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.password_hash = get_password_hash(new_password)
    session.add(user)
    
    # Mark OTP as used
    otp.used = True
    session.add(otp)
    
    session.commit()
    
    return {"message": "Password reset successfully"}
