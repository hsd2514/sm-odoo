from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.core.database import get_session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ProductRead)
def create_product(product: ProductCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_product = session.exec(select(Product).where(Product.sku == product.sku)).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    new_product = Product.model_validate(product, update={"current_stock": product.initial_stock})
    session.add(new_product)
    session.commit()
    session.refresh(new_product)
    return new_product

@router.get("/", response_model=List[ProductRead])
def read_products(offset: int = 0, limit: int = 100, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    products = session.exec(select(Product).offset(offset).limit(limit)).all()
    return products

@router.get("/{product_id}", response_model=ProductRead)
def read_product(product_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
