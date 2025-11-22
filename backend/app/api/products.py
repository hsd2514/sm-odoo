from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from app.core.database import get_session
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

def get_category_id(session: Session, category_id: Optional[int] = None, category_name: Optional[str] = None) -> Optional[int]:
    """Helper to get category_id from either category_id or category name"""
    if category_id:
        category = session.get(Category, category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category_id
    elif category_name:
        category = session.exec(select(Category).where(Category.name == category_name)).first()
        if category:
            return category.id
        # If category doesn't exist, create it
        new_category = Category(name=category_name)
        session.add(new_category)
        session.commit()
        session.refresh(new_category)
        return new_category.id
    return None

@router.post("/", response_model=ProductRead)
def create_product(product: ProductCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_product = session.exec(select(Product).where(Product.sku == product.sku)).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    
    # Handle category
    category_id = get_category_id(session, product.category_id, product.category)
    
    # Get category name if category_id exists
    category_name = None
    if category_id:
        category = session.get(Category, category_id)
        category_name = category.name if category else None
    
    product_data = product.model_dump(exclude={'category', 'category_id', 'initial_stock'})
    product_data['category_id'] = category_id
    product_data['category'] = category_name or ''  # Set to empty string if None to satisfy NOT NULL constraint
    product_data['current_stock'] = product.initial_stock
    
    new_product = Product(**product_data)
    session.add(new_product)
    session.commit()
    session.refresh(new_product)
    
    # Get category name for response
    category_name = None
    if new_product.category_id:
        category = session.get(Category, new_product.category_id)
        category_name = category.name if category else None
    
    response_data = ProductRead(
        id=new_product.id,
        name=new_product.name,
        sku=new_product.sku,
        category_id=new_product.category_id,
        category_name=category_name,
        uom=new_product.uom,
        current_stock=new_product.current_stock,
        min_stock_level=new_product.min_stock_level
    )
    return response_data

@router.get("/", response_model=List[ProductRead])
def read_products(offset: int = 0, limit: int = 100, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    products = session.exec(select(Product).offset(offset).limit(limit)).all()
    
    # Get category names
    category_ids = [p.category_id for p in products if p.category_id]
    categories = {}
    if category_ids:
        # Get unique category IDs
        unique_ids = list(set(category_ids))
        for cat_id in unique_ids:
            cat = session.get(Category, cat_id)
            if cat:
                categories[cat_id] = cat.name
    
    result = []
    for product in products:
        category_name = None
        if product.category_id and product.category_id in categories:
            category_name = categories[product.category_id]
        elif product.category:  # Fallback to old category field
            category_name = product.category
        
        result.append(ProductRead(
            id=product.id,
            name=product.name,
            sku=product.sku,
            category_id=product.category_id,
            category=category_name,  # For backward compatibility
            category_name=category_name,
            uom=product.uom,
            current_stock=product.current_stock,
            min_stock_level=product.min_stock_level
        ))
    return result

@router.get("/{product_id}", response_model=ProductRead)
def read_product(product_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    category_name = None
    if product.category_id:
        category = session.get(Category, product.category_id)
        category_name = category.name if category else None
    elif product.category:
        category_name = product.category
    
    return ProductRead(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category_id=product.category_id,
        category=category_name,
        category_name=category_name,
        uom=product.uom,
        current_stock=product.current_stock,
        min_stock_level=product.min_stock_level
    )

@router.put("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, product_update: ProductUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Handle category update
    if product_update.category_id is not None or product_update.category:
        category_id = get_category_id(session, product_update.category_id, product_update.category)
        product.category_id = category_id
    
    update_data = product_update.model_dump(exclude_unset=True, exclude={'category', 'category_id'})
    for field, value in update_data.items():
        setattr(product, field, value)
    
    session.add(product)
    session.commit()
    session.refresh(product)
    
    category_name = None
    if product.category_id:
        category = session.get(Category, product.category_id)
        category_name = category.name if category else None
    
    return ProductRead(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category_id=product.category_id,
        category=category_name,
        category_name=category_name,
        uom=product.uom,
        current_stock=product.current_stock,
        min_stock_level=product.min_stock_level
    )

@router.delete("/{product_id}")
def delete_product(product_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return {"message": "Product deleted successfully"}
