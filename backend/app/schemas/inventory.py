from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StockMoveBase(BaseModel):
    product_id: int
    quantity: int
    source_location: Optional[str] = None
    dest_location: Optional[str] = None
    source_warehouse_id: Optional[int] = None
    dest_warehouse_id: Optional[int] = None
    move_type: str

class StockMoveCreate(StockMoveBase):
    pass

class StockMoveRead(StockMoveBase):
    id: int
    reference: Optional[str] = None
    status: str
    created_at: datetime
