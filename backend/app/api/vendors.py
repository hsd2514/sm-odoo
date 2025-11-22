from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from app.core.database import get_session
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorRead, VendorUpdate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=VendorRead)
def create_vendor(vendor: VendorCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    new_vendor = Vendor.model_validate(vendor)
    session.add(new_vendor)
    session.commit()
    session.refresh(new_vendor)
    return new_vendor

@router.get("/", response_model=List[VendorRead])
def read_vendors(offset: int = 0, limit: int = 100, search: Optional[str] = None, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    query = select(Vendor)
    if search:
        from sqlalchemy import or_
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Vendor.name.like(search_term),
                Vendor.email.like(search_term),
                Vendor.phone.like(search_term)
            )
        )
    vendors = session.exec(query.offset(offset).limit(limit)).all()
    return vendors

@router.get("/{vendor_id}", response_model=VendorRead)
def read_vendor(vendor_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.put("/{vendor_id}", response_model=VendorRead)
def update_vendor(vendor_id: int, vendor_update: VendorUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    update_data = vendor_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vendor, field, value)
    
    session.add(vendor)
    session.commit()
    session.refresh(vendor)
    return vendor

@router.delete("/{vendor_id}")
def delete_vendor(vendor_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    session.delete(vendor)
    session.commit()
    return {"message": "Vendor deleted successfully"}

