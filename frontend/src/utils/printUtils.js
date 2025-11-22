/**
 * Utility functions for printing stock move documents
 */

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getMoveTypeLabel = (type) => {
  const labels = { 
    'IN': 'RECEIPT', 
    'OUT': 'DELIVERY ORDER', 
    'INT': 'INTERNAL TRANSFER', 
    'ADJ': 'STOCK ADJUSTMENT' 
  };
  return labels[type] || type;
};

const getPrintHTML = (move, product, vendor, customer, warehouse) => {
  return `
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
  `;
};

export const printMoveDocument = (move, products, vendors, customers, warehouses) => {
  const product = products.find(p => p.id === move.product_id);
  const vendor = vendors.find(v => v.id === move.vendor_id);
  const customer = customers.find(c => c.id === move.customer_id);
  const warehouse = warehouses.find(w => w.id === (move.source_warehouse_id || move.dest_warehouse_id));
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(getPrintHTML(move, product, vendor, customer, warehouse));
    printWindow.document.close();
  }
};

