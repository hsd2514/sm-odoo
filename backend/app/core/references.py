"""
Utility functions for generating auto-incrementing references.
Format: AW/YYYY/0001 (e.g., AW/2023/0001)
"""
from sqlmodel import Session, select
from app.models.inventory import StockMove
from datetime import datetime
from typing import Optional

def generate_reference(move_type: str, session: Session) -> str:
    """
    Generate a reference number in format: AW/YYYY/0001
    
    Rules:
    - AW prefix (can be customized per move type)
    - YYYY is current year
    - 0001-9999 serial number (max 4 digits)
    - Resets per year
    """
    current_year = datetime.now().year
    
    # Determine prefix based on move type
    prefix_map = {
        "IN": "AW",   # Receipts
        "OUT": "AW",  # Deliveries (can be customized)
        "INT": "INT", # Internal Transfers
        "ADJ": "ADJ"  # Adjustments
    }
    prefix = prefix_map.get(move_type, "AW")
    
    # Get all moves of this type with references
    all_moves = session.exec(
        select(StockMove).where(
            (StockMove.move_type == move_type) &
            (StockMove.reference.isnot(None))
        )
    ).all()
    
    # Extract serial numbers from existing references for current year
    max_serial = 0
    for move in all_moves:
        if move.reference:
            try:
                # Parse reference: AW/2023/0001 -> extract year and serial
                parts = move.reference.split('/')
                if len(parts) == 3:
                    ref_year = int(parts[1])
                    if ref_year == current_year:
                        serial = int(parts[2])
                        max_serial = max(max_serial, serial)
            except (ValueError, IndexError):
                continue
    
    # Increment serial number
    next_serial = max_serial + 1
    
    # Format with leading zeros (4 digits max)
    if next_serial > 9999:
        raise ValueError(f"Serial number exceeded maximum (9999) for {move_type} in year {current_year}")
    
    serial_str = str(next_serial).zfill(4)
    
    # Generate reference: AW/YYYY/0001
    reference = f"{prefix}/{current_year}/{serial_str}"
    
    return reference

