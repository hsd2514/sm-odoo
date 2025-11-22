from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.core.database import get_session
from app.models.inventory import StockMove, ProductStock
from app.models.product import Product
from app.schemas.inventory import StockMoveCreate, StockMoveRead
from app.api.deps import get_current_user
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/moves", response_model=StockMoveRead)
def create_stock_move(move: StockMoveCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    logger.info(f"🔵 CREATE MOVE - Type: {move.move_type}, Product: {move.product_id}, Qty: {move.quantity}")
    stock_move = StockMove.model_validate(move)
    session.add(stock_move)
    session.commit()
    session.refresh(stock_move)
    return stock_move

@router.post("/moves/{move_id}/validate", response_model=StockMoveRead)
def validate_stock_move(move_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    logger.info(f"🔵 VALIDATE MOVE - Move ID: {move_id}")
    stock_move = session.get(StockMove, move_id)
    if not stock_move:
        raise HTTPException(status_code=404, detail="Move not found")
    if stock_move.status == "done":
        raise HTTPException(status_code=400, detail="Move already validated")
    
    product = session.get(Product, stock_move.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if stock_move.move_type == "IN":
        # For receipts, update warehouse stock if warehouse is specified
        if stock_move.source_warehouse_id:
            warehouse_stock = session.exec(
                select(ProductStock).where(
                    (ProductStock.product_id == stock_move.product_id) &
                    (ProductStock.warehouse_id == stock_move.source_warehouse_id)
                )
            ).first()
            
            if not warehouse_stock:
                warehouse_stock = ProductStock(
                    product_id=stock_move.product_id,
                    warehouse_id=stock_move.source_warehouse_id,
                    quantity=0
                )
                session.add(warehouse_stock)
            
            warehouse_stock.quantity += stock_move.quantity
        
        product.current_stock += stock_move.quantity
        
    elif stock_move.move_type == "OUT":
        if product.current_stock < stock_move.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock. Available: {product.current_stock}, Required: {stock_move.quantity}"
            )
        product.current_stock -= stock_move.quantity
        
    elif stock_move.move_type == "ADJ":
        # For adjustments, quantity can be negative or positive
        product.current_stock += stock_move.quantity
        
    elif stock_move.move_type == "INT":
        # Internal transfer between warehouses
        if not stock_move.source_warehouse_id or not stock_move.dest_warehouse_id:
            raise HTTPException(status_code=400, detail="Source and destination warehouses required for internal transfers")
        
        # Get source stock
        source_stock = session.exec(
            select(ProductStock).where(
                (ProductStock.product_id == stock_move.product_id) &
                (ProductStock.warehouse_id == stock_move.source_warehouse_id)
            )
        ).first()
        
        if not source_stock or source_stock.quantity < stock_move.quantity:
            available = source_stock.quantity if source_stock else 0
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock in source warehouse. Available: {available}, Required: {stock_move.quantity}"
            )
        
        # Get or create dest stock
        dest_stock = session.exec(
            select(ProductStock).where(
                (ProductStock.product_id == stock_move.product_id) &
                (ProductStock.warehouse_id == stock_move.dest_warehouse_id)
            )
        ).first()
        
        if not dest_stock:
            dest_stock = ProductStock(
                product_id=stock_move.product_id,
                warehouse_id=stock_move.dest_warehouse_id,
                quantity=0
            )
            session.add(dest_stock)
        
        # Update stocks
        source_stock.quantity -= stock_move.quantity
        dest_stock.quantity += stock_move.quantity
        session.add(source_stock)
        session.add(dest_stock)

    stock_move.status = "done"
    session.add(stock_move)
    session.add(product)
    session.commit()
    session.refresh(stock_move)
    return stock_move

@router.get("/moves", response_model=List[StockMoveRead])
def read_stock_moves(offset: int = 0, limit: int = 100, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    moves = session.exec(select(StockMove).offset(offset).limit(limit)).all()
    return moves
