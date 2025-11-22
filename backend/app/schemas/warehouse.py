from pydantic import BaseModel
from typing import Optional

class WarehouseBase(BaseModel):
    name: str
    location: str

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseRead(WarehouseBase):
    id: int

    class Config:
        from_attributes = True

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None

