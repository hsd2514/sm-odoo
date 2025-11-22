import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useProducts, useWarehouses, useVendors, useCustomers } from '../hooks/useApiData';
import SearchBar from '../components/ui/SearchBar';
import FilterBar from '../components/ui/FilterBar';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import PrintTemplate from '../components/PrintTemplate';
import Button from '../components/ui/Button';
import { printMoveDocument } from '../utils/printUtils';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, ClipboardCheck, Printer } from 'lucide-react';

const MoveHistory = () => {
  const [moves, setMoves] = useState([]);
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const { data: vendors } = useVendors();
  const { data: customers } = useCustomers();
  const [loading, setLoading] = useState(true);
  const [printMove, setPrintMove] = useState(null);
  const printRef = useRef();
  const [searchQuery, setSearchQuery] = useState('');
  const [moveTypeFilter, setMoveTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  useEffect(() => {
    fetchMoves();
  }, [moveTypeFilter, statusFilter, warehouseFilter, searchQuery]);

  const fetchMoves = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (moveTypeFilter) params.append('move_type', moveTypeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/operations/moves?${params.toString()}`);
      setMoves(response.data);
    } catch (error) {
      console.error("Failed to fetch moves", error);
    } finally {
      setLoading(false);
    }
  };


  const getMoveTypeIcon = (type) => {
    const icons = {
      'IN': ArrowDownLeft,
      'OUT': ArrowUpRight,
      'INT': ArrowRightLeft,
      'ADJ': ClipboardCheck
    };
    return icons[type] || ClipboardCheck;
  };

  const getMoveTypeColor = (type) => {
    const colors = {
      'IN': 'bg-green-200',
      'OUT': 'bg-yellow-200',
      'INT': 'bg-blue-200',
      'ADJ': 'bg-gray-200'
    };
    return colors[type] || 'bg-gray-200';
  };


  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openPrintDialog = (move) => {
    setPrintMove(move);
    // Wait for React to render, then open print window
    setTimeout(() => {
      if (printRef.current) {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
          const product = products.find(p => p.id === move.product_id);
          const vendor = vendors.find(v => v.id === move.vendor_id);
          const customer = customers.find(c => c.id === move.customer_id);
          const warehouse = warehouses.find(w => w.id === (move.source_warehouse_id || move.dest_warehouse_id));
          
          const formatDate = (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          };
          
          const getMoveTypeLabel = (type) => {
            const labels = { 'IN': 'RECEIPT', 'OUT': 'DELIVERY ORDER', 'INT': 'INTERNAL TRANSFER', 'ADJ': 'STOCK ADJUSTMENT' };
            return labels[type] || type;
          };
          
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${move.reference || `#${move.id}`} - ${move.move_type}</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { 
                    font-family: 'Arial', 'Helvetica', sans-serif; 
                    padding: 40px; 
                    background: #f5f5f5;
                  }
                  .print-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border: 4px solid #000;
                    padding: 40px;
                    box-shadow: 8px 8px 0px #000;
                  }
                  .header { 
                    border-bottom: 4px solid #000; 
                    padding-bottom: 20px; 
                    margin-bottom: 24px; 
                  }
                  h1 { 
                    font-size: 2.5rem; 
                    font-weight: 900; 
                    text-transform: uppercase; 
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                  }
                  h2 { 
                    font-size: 1.75rem; 
                    font-weight: 700; 
                    text-transform: uppercase;
                    color: #333;
                  }
                  .info-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 24px; 
                    margin-bottom: 24px; 
                    padding-bottom: 24px; 
                    border-bottom: 2px solid #000; 
                  }
                  .label { 
                    font-weight: 700; 
                    font-size: 0.875rem; 
                    text-transform: uppercase; 
                    color: #666;
                    margin-bottom: 4px;
                    letter-spacing: 0.5px;
                  }
                  .value { 
                    font-size: 1.25rem; 
                    font-weight: 900; 
                    color: #000;
                  }
                  .details-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 24px; 
                    margin-bottom: 24px; 
                    padding-bottom: 24px; 
                    border-bottom: 2px solid #000; 
                  }
                  .section { 
                    margin-bottom: 24px; 
                    padding-bottom: 24px; 
                    border-bottom: 2px solid #000; 
                  }
                  .section-title {
                    font-weight: 700;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    color: #666;
                    margin-bottom: 8px;
                    letter-spacing: 0.5px;
                  }
                  .section-content {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #000;
                    margin-bottom: 12px;
                  }
                  .section-details {
                    font-size: 0.875rem;
                    color: #555;
                    margin-top: 8px;
                    line-height: 1.6;
                  }
                  .footer { 
                    border-top: 4px solid #000; 
                    padding-top: 20px; 
                    margin-top: 24px; 
                    text-align: center; 
                    font-size: 0.875rem;
                    color: #666;
                  }
                  .footer-bold {
                    font-weight: 700;
                    color: #000;
                    margin-bottom: 4px;
                  }
                  @media print {
                    body { 
                      padding: 0; 
                      background: white;
                    }
                    .print-container { 
                      border: 4px solid #000; 
                      padding: 40px;
                      box-shadow: none;
                      max-width: 100%;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="print-container">
                  <div class="header">
                    <h1>StockMaster IMS</h1>
                    <h2>${getMoveTypeLabel(move.move_type)}</h2>
                  </div>
                  
                  <div class="info-grid">
                    <div>
                      <div class="label">Reference</div>
                      <div class="value">${move.reference || `#${move.id}`}</div>
                    </div>
                    <div>
                      <div class="label">Date</div>
                      <div class="value">${formatDate(move.created_at)}</div>
                    </div>
                  </div>
                  
                  <div class="details-grid">
                    <div>
                      <div class="label">Product</div>
                      <div class="value">${product?.name || `Product #${move.product_id}`}</div>
                      <div class="section-details">SKU: ${product?.sku || 'N/A'}</div>
                    </div>
                    <div>
                      <div class="label">Quantity</div>
                      <div class="value">${move.quantity} ${product?.uom || 'units'}</div>
                    </div>
                  </div>
                  
                  <div class="section">
                    ${move.move_type === 'IN' ? `
                      <div class="section-title">From (Vendor)</div>
                      <div class="section-content">${vendor?.name || move.source_location || 'N/A'}</div>
                      ${vendor ? `
                        <div class="section-details">
                          ${vendor.email ? `<div>Email: ${vendor.email}</div>` : ''}
                          ${vendor.phone ? `<div>Phone: ${vendor.phone}</div>` : ''}
                        </div>
                      ` : ''}
                      <div class="section-title" style="margin-top: 16px;">To (Warehouse)</div>
                      <div class="section-content">${warehouse?.name || move.dest_location || 'N/A'}</div>
                    ` : move.move_type === 'OUT' ? `
                      <div class="section-title">From (Warehouse)</div>
                      <div class="section-content">${warehouse?.name || move.source_location || 'N/A'}</div>
                      <div class="section-title" style="margin-top: 16px;">To (Customer)</div>
                      <div class="section-content">${customer?.name || move.dest_location || 'N/A'}</div>
                      ${customer ? `
                        <div class="section-details">
                          ${customer.email ? `<div>Email: ${customer.email}</div>` : ''}
                          ${customer.phone ? `<div>Phone: ${customer.phone}</div>` : ''}
                          ${customer.address ? `<div>Address: ${customer.address}</div>` : ''}
                        </div>
                      ` : ''}
                    ` : move.move_type === 'INT' ? `
                      <div class="section-title">From Warehouse</div>
                      <div class="section-content">${move.source_location || 'N/A'}</div>
                      <div class="section-title" style="margin-top: 16px;">To Warehouse</div>
                      <div class="section-content">${move.dest_location || 'N/A'}</div>
                    ` : `
                      <div class="section-title">Warehouse</div>
                      <div class="section-content">${warehouse?.name || move.source_location || move.dest_location || 'N/A'}</div>
                    `}
                  </div>
                  
                  <div class="section" style="border-bottom: none;">
                    <div class="label">Status</div>
                    <div class="value" style="text-transform: uppercase;">${move.status}</div>
                  </div>
                  
                  <div class="footer">
                    <div class="footer-bold">Generated by StockMaster Inventory Management System</div>
                    <div>Print Date: ${new Date().toLocaleString()}</div>
                  </div>
                </div>
                <script>
                  window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                      window.close();
                    };
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } else {
        // Fallback: retry once
        setTimeout(() => {
          if (printRef.current) {
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
              const product = products.find(p => p.id === move.product_id);
              const vendor = vendors.find(v => v.id === move.vendor_id);
              const customer = customers.find(c => c.id === move.customer_id);
              const warehouse = warehouses.find(w => w.id === (move.source_warehouse_id || move.dest_warehouse_id));
              
              const formatDate = (dateString) => {
                if (!dateString) return '-';
                const date = new Date(dateString);
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              };
              
              const getMoveTypeLabel = (type) => {
                const labels = { 'IN': 'RECEIPT', 'OUT': 'DELIVERY ORDER', 'INT': 'INTERNAL TRANSFER', 'ADJ': 'STOCK ADJUSTMENT' };
                return labels[type] || type;
              };
              
              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>${move.reference || `#${move.id}`} - ${move.move_type}</title>
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      body { 
                        font-family: 'Arial', 'Helvetica', sans-serif; 
                        padding: 40px; 
                        background: #f5f5f5;
                      }
                      .print-container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        border: 4px solid #000;
                        padding: 40px;
                        box-shadow: 8px 8px 0px #000;
                      }
                      .header { 
                        border-bottom: 4px solid #000; 
                        padding-bottom: 20px; 
                        margin-bottom: 24px; 
                      }
                      h1 { 
                        font-size: 2.5rem; 
                        font-weight: 900; 
                        text-transform: uppercase; 
                        margin-bottom: 8px;
                        letter-spacing: 1px;
                      }
                      h2 { 
                        font-size: 1.75rem; 
                        font-weight: 700; 
                        text-transform: uppercase;
                        color: #333;
                      }
                      .info-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 24px; 
                        margin-bottom: 24px; 
                        padding-bottom: 24px; 
                        border-bottom: 2px solid #000; 
                      }
                      .label { 
                        font-weight: 700; 
                        font-size: 0.875rem; 
                        text-transform: uppercase; 
                        color: #666;
                        margin-bottom: 4px;
                        letter-spacing: 0.5px;
                      }
                      .value { 
                        font-size: 1.25rem; 
                        font-weight: 900; 
                        color: #000;
                      }
                      .details-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 24px; 
                        margin-bottom: 24px; 
                        padding-bottom: 24px; 
                        border-bottom: 2px solid #000; 
                      }
                      .section { 
                        margin-bottom: 24px; 
                        padding-bottom: 24px; 
                        border-bottom: 2px solid #000; 
                      }
                      .section-title {
                        font-weight: 700;
                        font-size: 0.875rem;
                        text-transform: uppercase;
                        color: #666;
                        margin-bottom: 8px;
                        letter-spacing: 0.5px;
                      }
                      .section-content {
                        font-size: 1.125rem;
                        font-weight: 600;
                        color: #000;
                        margin-bottom: 12px;
                      }
                      .section-details {
                        font-size: 0.875rem;
                        color: #555;
                        margin-top: 8px;
                        line-height: 1.6;
                      }
                      .footer { 
                        border-top: 4px solid #000; 
                        padding-top: 20px; 
                        margin-top: 24px; 
                        text-align: center; 
                        font-size: 0.875rem;
                        color: #666;
                      }
                      .footer-bold {
                        font-weight: 700;
                        color: #000;
                        margin-bottom: 4px;
                      }
                      @media print {
                        body { 
                          padding: 0; 
                          background: white;
                        }
                        .print-container { 
                          border: 4px solid #000; 
                          padding: 40px;
                          box-shadow: none;
                          max-width: 100%;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="print-container">
                      <div class="header">
                        <h1>StockMaster IMS</h1>
                        <h2>${getMoveTypeLabel(move.move_type)}</h2>
                      </div>
                      
                      <div class="info-grid">
                        <div>
                          <div class="label">Reference</div>
                          <div class="value">${move.reference || `#${move.id}`}</div>
                        </div>
                        <div>
                          <div class="label">Date</div>
                          <div class="value">${formatDate(move.created_at)}</div>
                        </div>
                      </div>
                      
                      <div class="details-grid">
                        <div>
                          <div class="label">Product</div>
                          <div class="value">${product?.name || `Product #${move.product_id}`}</div>
                          <div class="section-details">SKU: ${product?.sku || 'N/A'}</div>
                        </div>
                        <div>
                          <div class="label">Quantity</div>
                          <div class="value">${move.quantity} ${product?.uom || 'units'}</div>
                        </div>
                      </div>
                      
                      <div class="section">
                        ${move.move_type === 'IN' ? `
                          <div class="section-title">From (Vendor)</div>
                          <div class="section-content">${vendor?.name || move.source_location || 'N/A'}</div>
                          ${vendor ? `
                            <div class="section-details">
                              ${vendor.email ? `<div>Email: ${vendor.email}</div>` : ''}
                              ${vendor.phone ? `<div>Phone: ${vendor.phone}</div>` : ''}
                            </div>
                          ` : ''}
                          <div class="section-title" style="margin-top: 16px;">To (Warehouse)</div>
                          <div class="section-content">${warehouse?.name || move.dest_location || 'N/A'}</div>
                        ` : move.move_type === 'OUT' ? `
                          <div class="section-title">From (Warehouse)</div>
                          <div class="section-content">${warehouse?.name || move.source_location || 'N/A'}</div>
                          <div class="section-title" style="margin-top: 16px;">To (Customer)</div>
                          <div class="section-content">${customer?.name || move.dest_location || 'N/A'}</div>
                          ${customer ? `
                            <div class="section-details">
                              ${customer.email ? `<div>Email: ${customer.email}</div>` : ''}
                              ${customer.phone ? `<div>Phone: ${customer.phone}</div>` : ''}
                              ${customer.address ? `<div>Address: ${customer.address}</div>` : ''}
                            </div>
                          ` : ''}
                        ` : move.move_type === 'INT' ? `
                          <div class="section-title">From Warehouse</div>
                          <div class="section-content">${move.source_location || 'N/A'}</div>
                          <div class="section-title" style="margin-top: 16px;">To Warehouse</div>
                          <div class="section-content">${move.dest_location || 'N/A'}</div>
                        ` : `
                          <div class="section-title">Warehouse</div>
                          <div class="section-content">${warehouse?.name || move.source_location || move.dest_location || 'N/A'}</div>
                        `}
                      </div>
                      
                      <div class="section" style="border-bottom: none;">
                        <div class="label">Status</div>
                        <div class="value" style="text-transform: uppercase;">${move.status}</div>
                      </div>
                      
                      <div class="footer">
                        <div class="footer-bold">Generated by StockMaster Inventory Management System</div>
                        <div>Print Date: ${new Date().toLocaleString()}</div>
                      </div>
                    </div>
                    <script>
                      window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                          window.close();
                        };
                      };
                    </script>
                  </body>
                </html>
              `);
              printWindow.document.close();
            }
          }
        }, 500);
      }
    }, 300);
  };

  return (
    <div>
      <h2 className="text-3xl font-black uppercase mb-8">Move History</h2>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar
          placeholder="Search by reference, source, or destination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FilterBar
          filters={[
            {
              label: 'Document Type',
              value: moveTypeFilter,
              onChange: (e) => setMoveTypeFilter(e.target.value),
              options: [
                { value: '', label: 'All Types' },
                { value: 'IN', label: 'Receipts' },
                { value: 'OUT', label: 'Deliveries' },
                { value: 'INT', label: 'Transfers' },
                { value: 'ADJ', label: 'Adjustments' }
              ]
            },
            {
              label: 'Status',
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              options: [
                { value: '', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'waiting', label: 'Waiting' },
                { value: 'ready', label: 'Ready' },
                { value: 'done', label: 'Done' },
                { value: 'cancelled', label: 'Cancelled' }
              ]
            }
          ]}
        />
      </div>

      {/* Moves Table */}
      <DataTable
        columns={[
          { header: 'Reference' },
          { header: 'Type' },
          { header: 'Product' },
          { header: 'Quantity' },
          { header: 'From' },
          { header: 'To' },
          { header: 'Status' },
          { header: 'Date' },
          { header: 'Actions' }
        ]}
        data={moves}
        loading={loading}
        emptyMessage="No moves found."
        renderRow={(move) => {
          const product = products.find(p => p.id === move.product_id);
          const TypeIcon = getMoveTypeIcon(move.move_type);
          return (
            <tr key={move.id} className="border-b-2 border-black hover:bg-gray-50">
              <td className="p-4 border-r-2 border-black font-mono font-bold">
                {move.reference || `#${move.id}`}
              </td>
              <td className="p-4 border-r-2 border-black">
                <div className={`flex items-center gap-2 px-2 py-1 ${getMoveTypeColor(move.move_type)} border-2 border-black`}>
                  <TypeIcon size={16} />
                  <span className="font-bold">{move.move_type}</span>
                </div>
              </td>
              <td className="p-4 border-r-2 border-black">{product?.name || `Product #${move.product_id}`}</td>
              <td className="p-4 border-r-2 border-black font-bold">{move.quantity}</td>
              <td className="p-4 border-r-2 border-black text-sm">
                {move.source_location || (move.source_warehouse_id ? warehouses.find(w => w.id === move.source_warehouse_id)?.name || `WH#${move.source_warehouse_id}` : '-')}
              </td>
              <td className="p-4 border-r-2 border-black text-sm">
                {move.dest_location || (move.dest_warehouse_id ? warehouses.find(w => w.id === move.dest_warehouse_id)?.name || `WH#${move.dest_warehouse_id}` : '-')}
              </td>
              <td className="p-4 border-r-2 border-black">
                <StatusBadge status={move.status} />
              </td>
              <td className="p-4 text-sm border-r-2 border-black">{formatDate(move.created_at)}</td>
              <td className="p-4">
                <Button 
                  variant="secondary" 
                  className="text-xs py-1 px-2 flex items-center gap-1"
                  onClick={() => openPrintDialog(move)}
                >
                  <Printer size={14} />
                  Print
                </Button>
              </td>
            </tr>
          );
        }}
      />

      {/* Hidden Print Template - Always render wrapper so ref is always available */}
      <div 
        ref={printRef}
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px', 
          width: '210mm', 
          minHeight: '297mm',
          padding: '20mm',
          backgroundColor: 'white'
        }}
      >
        {printMove && (
          <PrintTemplate
            move={printMove}
            product={products.find(p => p.id === printMove.product_id)}
            vendor={vendors.find(v => v.id === printMove.vendor_id)}
            customer={customers.find(c => c.id === printMove.customer_id)}
            warehouse={warehouses.find(w => w.id === (printMove.source_warehouse_id || printMove.dest_warehouse_id))}
          />
        )}
      </div>
    </div>
  );
};

export default MoveHistory;

