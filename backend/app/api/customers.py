from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from app.core.database import get_session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=CustomerRead)
def create_customer(customer: CustomerCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    new_customer = Customer.model_validate(customer)
    session.add(new_customer)
    session.commit()
    session.refresh(new_customer)
    return new_customer

@router.get("/", response_model=List[CustomerRead])
def read_customers(offset: int = 0, limit: int = 100, search: Optional[str] = None, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    query = select(Customer)
    if search:
        from sqlalchemy import or_
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Customer.name.like(search_term),
                Customer.email.like(search_term),
                Customer.phone.like(search_term)
            )
        )
    customers = session.exec(query.offset(offset).limit(limit)).all()
    return customers

@router.get("/{customer_id}", response_model=CustomerRead)
def read_customer(customer_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(customer_id: int, customer_update: CustomerUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = customer_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    session.delete(customer)
    session.commit()
    return {"message": "Customer deleted successfully"}

