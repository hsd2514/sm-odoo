from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.inventory import Warehouse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/")
def get_warehouses(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    warehouses = session.exec(select(Warehouse)).all()
    return warehouses
