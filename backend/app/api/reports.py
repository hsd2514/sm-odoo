from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.product import Product
from app.models.inventory import StockMove, ProductStock, Warehouse
from app.api.deps import get_current_user
from app.models.user import User
import csv
import io

router = APIRouter()

@router.get("/products/csv")
def export_products_csv(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    products = session.exec(select(Product)).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Name', 'SKU', 'Category', 'UoM', 'Current Stock'])
    
    for p in products:
        writer.writerow([p.id, p.name, p.sku, p.category, p.uom, p.current_stock])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"}
    )

@router.get("/stock-moves/csv")
def export_stock_moves_csv(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    moves = session.exec(select(StockMove)).all()
    products = {p.id: p for p in session.exec(select(Product)).all()}
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Product', 'Type', 'Quantity', 'Source', 'Destination', 'Status', 'Created At'])
    
    for m in moves:
        product_name = products.get(m.product_id).name if m.product_id in products else f"Product #{m.product_id}"
        writer.writerow([
            m.id, 
            product_name, 
            m.move_type, 
            m.quantity, 
            m.source_location or f"WH#{m.source_warehouse_id}" if m.source_warehouse_id else "", 
            m.dest_location or f"WH#{m.dest_warehouse_id}" if m.dest_warehouse_id else "",
            m.status,
            m.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=stock_moves.csv"}
    )

@router.get("/warehouse-stock/csv")
def export_warehouse_stock_csv(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    stocks = session.exec(select(ProductStock)).all()
    products = {p.id: p for p in session.exec(select(Product)).all()}
    warehouses = {w.id: w for w in session.exec(select(Warehouse)).all()}
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Product', 'Warehouse', 'Location', 'Quantity'])
    
    for s in stocks:
        product_name = products.get(s.product_id).name if s.product_id in products else f"Product #{s.product_id}"
        warehouse = warehouses.get(s.warehouse_id)
        warehouse_name = warehouse.name if warehouse else f"WH#{s.warehouse_id}"
        warehouse_location = warehouse.location if warehouse else ""
        writer.writerow([product_name, warehouse_name, warehouse_location, s.quantity])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=warehouse_stock.csv"}
    )
