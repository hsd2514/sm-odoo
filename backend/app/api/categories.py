from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.core.database import get_session
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[CategoryRead])
def get_categories(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    categories = session.exec(select(Category)).all()
    return categories

@router.post("/", response_model=CategoryRead)
def create_category(category: CategoryCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Check if category with same name exists
    existing = session.exec(select(Category).where(Category.name == category.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    db_category = Category.model_validate(category)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{category_id}", response_model=CategoryRead)
def update_category(category_id: int, category_update: CategoryUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if new name conflicts with existing category
    if category_update.name and category_update.name != category.name:
        existing = session.exec(select(Category).where(Category.name == category_update.name)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    update_data = category_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(category_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if any products use this category
    from app.models.product import Product
    products = session.exec(select(Product).where(Product.category == category.name)).all()
    if products:
        raise HTTPException(status_code=400, detail=f"Cannot delete category. {len(products)} product(s) are using it.")
    
    session.delete(category)
    session.commit()
    return {"message": "Category deleted successfully"}

