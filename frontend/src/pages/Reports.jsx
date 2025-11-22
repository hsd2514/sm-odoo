import React from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import { FileDown } from 'lucide-react';

const Reports = () => {
  const handleExport = async (endpoint, filename) => {
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      // Create blob with explicit CSV MIME type
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Use .download instead of .setAttribute
      document.body.appendChild(link);
      link.click();
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export", error);
      alert("Failed to export data: " + (error.response?.data?.detail || error.message));
    }
  };

  const reports = [
    { title: 'Products Report', description: 'Export all products with current stock levels', endpoint: '/reports/products/csv', filename: 'products.csv' },
    { title: 'Stock Moves Report', description: 'Export all inventory movements (receipts, deliveries, transfers)', endpoint: '/reports/stock-moves/csv', filename: 'stock_moves.csv' },
    { title: 'Warehouse Stock Report', description: 'Export stock levels by warehouse', endpoint: '/reports/warehouse-stock/csv', filename: 'warehouse_stock.csv' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-black uppercase mb-8">Reports & Exports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <div key={index} className="neo-box p-6 bg-white">
            <h3 className="text-xl font-black mb-2 uppercase">{report.title}</h3>
            <p className="text-sm mb-4 text-gray-700">{report.description}</p>
            <Button 
              onClick={() => handleExport(report.endpoint, report.filename)}
              className="w-full flex items-center justify-center gap-2"
            >
              <FileDown size={18} />
              Export CSV
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
