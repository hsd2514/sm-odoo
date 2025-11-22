from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.core.database import get_session
from app.models.inventory import Warehouse, StockMove
from app.schemas.warehouse import WarehouseCreate, WarehouseRead, WarehouseUpdate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[WarehouseRead])
def get_warehouses(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    warehouses = session.exec(select(Warehouse)).all()
    return warehouses

@router.post("/", response_model=WarehouseRead)
def create_warehouse(warehouse: WarehouseCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Check if warehouse with same name exists
    existing = session.exec(select(Warehouse).where(Warehouse.name == warehouse.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Warehouse with this name already exists")
    
    db_warehouse = Warehouse.model_validate(warehouse)
    session.add(db_warehouse)
    session.commit()
    session.refresh(db_warehouse)
    return db_warehouse

@router.get("/{warehouse_id}", response_model=WarehouseRead)
def get_warehouse(warehouse_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    warehouse = session.get(Warehouse, warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse

@router.put("/{warehouse_id}", response_model=WarehouseRead)
def update_warehouse(warehouse_id: int, warehouse_update: WarehouseUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    warehouse = session.get(Warehouse, warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    # Check if new name conflicts with existing warehouse
    if warehouse_update.name and warehouse_update.name != warehouse.name:
        existing = session.exec(select(Warehouse).where(Warehouse.name == warehouse_update.name)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Warehouse with this name already exists")
    
    update_data = warehouse_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(warehouse, field, value)
    
    session.add(warehouse)
    session.commit()
    session.refresh(warehouse)
    return warehouse

@router.delete("/{warehouse_id}")
def delete_warehouse(warehouse_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    warehouse = session.get(Warehouse, warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    # Check if any stock moves reference this warehouse
    moves = session.exec(
        select(StockMove).where(
            (StockMove.source_warehouse_id == warehouse_id) | 
            (StockMove.dest_warehouse_id == warehouse_id)
        )
    ).all()
    if moves:
        raise HTTPException(status_code=400, detail=f"Cannot delete warehouse. {len(moves)} stock move(s) reference it.")
    
    session.delete(warehouse)
    session.commit()
    return {"message": "Warehouse deleted successfully"}
