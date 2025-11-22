from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    uom: str

class ProductCreate(ProductBase):
    initial_stock: int = 0

class ProductRead(ProductBase):
    id: int
    current_stock: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    uom: Optional[str] = None
