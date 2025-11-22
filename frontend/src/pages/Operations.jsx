import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useProducts, useWarehouses, useVendors, useCustomers } from '../hooks/useApiData';
import { handleApiError } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchBar from '../components/ui/SearchBar';
import Select from '../components/ui/Select';
import StatusBadge from '../components/ui/StatusBadge';
import DataTable from '../components/ui/DataTable';
import PrintTemplate from '../components/PrintTemplate';
import { printMoveDocument } from '../utils/printUtils';
import { ArrowRightLeft, ArrowDownLeft, ArrowUpRight, ClipboardCheck, Printer } from 'lucide-react';

const Operations = () => {
  const [moves, setMoves] = useState([]);
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const { data: vendors } = useVendors();
  const { data: customers } = useCustomers();
  const [loading, setLoading] = useState(true);
  const [printMove, setPrintMove] = useState(null);
  const printRef = useRef();
  const [activeTab, setActiveTab] = useState('IN'); // IN, OUT, INT, ADJ
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newMove, setNewMove] = useState({ 
    product_id: '', 
    quantity: 0, 
    source_location: '', 
    dest_location: '',
    source_warehouse_id: '',
    dest_warehouse_id: '',
    vendor_id: '',
    customer_id: ''
  });

  useEffect(() => {
    fetchMoves();
  }, [activeTab, statusFilter, searchQuery]);

  const fetchMoves = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab) params.append('move_type', activeTab);
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


  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const moveData = { 
        ...newMove, 
        move_type: activeTab, 
        product_id: parseInt(newMove.product_id),
        source_warehouse_id: newMove.source_warehouse_id ? parseInt(newMove.source_warehouse_id) : null,
        dest_warehouse_id: newMove.dest_warehouse_id ? parseInt(newMove.dest_warehouse_id) : null,
        vendor_id: newMove.vendor_id ? parseInt(newMove.vendor_id) : null,
        customer_id: newMove.customer_id ? parseInt(newMove.customer_id) : null
      };
      await api.post('/operations/moves', moveData);
      setNewMove({ 
        product_id: '', 
        quantity: 0, 
        source_location: '', 
        dest_location: '',
        source_warehouse_id: '',
        dest_warehouse_id: '',
        vendor_id: '',
        customer_id: ''
      });
      fetchMoves();
    } catch (error) {
      handleApiError(error, "Failed to create move");
    }
  };

  const handleValidate = async (moveId) => {
    try {
      await api.post(`/operations/moves/${moveId}/validate`);
      fetchMoves();
    } catch (error) {
      handleApiError(error, "Failed to validate move (Check stock levels)");
    }
  };

  const handleStatusChange = async (moveId, newStatus) => {
    try {
      await api.post(`/operations/moves/${moveId}/status?new_status=${newStatus}`);
      fetchMoves();
    } catch (error) {
      handleApiError(error, "Failed to update status");
    }
  };

  const openPrintDialog = (move) => {
    setPrintMove(move);
    // Wait a bit for state update, then print
    setTimeout(() => {
      printMoveDocument(move, products, vendors, customers, warehouses);
    }, 100);
  };


  const getNextStatus = (currentStatus) => {
    const transitions = {
      'draft': ['waiting', 'cancelled'],
      'waiting': ['ready', 'cancelled'],
      'ready': ['done', 'cancelled'],
      'done': [],
      'cancelled': ['draft']
    };
    return transitions[currentStatus] || [];
  };

  const tabs = [
    { id: 'IN', label: 'Receipts', icon: ArrowDownLeft, color: 'bg-green-200' },
    { id: 'OUT', label: 'Deliveries', icon: ArrowUpRight, color: 'bg-yellow-200' },
    { id: 'INT', label: 'Transfers', icon: ArrowRightLeft, color: 'bg-blue-200' },
    { id: 'ADJ', label: 'Adjustments', icon: ClipboardCheck, color: 'bg-gray-200' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Operations</h2>
          <p className="text-slate-600 font-medium mt-1">Manage your inventory movements</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
                <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setStatusFilter(''); // Reset status filter when changing tab
                    }}
                    className={`flex items-center gap-2 px-6 py-3 font-bold rounded-t-lg transition-all border-b-2 ${
                        isActive 
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <Icon size={18} />
                    {tab.label}
                </button>
            );
        })}
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full md:w-auto">
          <SearchBar
            placeholder="Search by reference, source, or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="waiting">Waiting</option>
            <option value="ready">Ready</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
                <h3 className="text-lg font-black mb-4 uppercase border-b border-slate-100 pb-2 text-slate-800">New {tabs.find(t => t.id === activeTab)?.label}</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block font-bold mb-1 text-sm text-slate-700">Product</label>
                        <Select
                            value={newMove.product_id}
                            onChange={(e) => setNewMove({...newMove, product_id: e.target.value})}
                            className="w-full"
                            required
                        >
                            <option value="">Select Product</option>
                            {products?.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block font-bold mb-1 text-sm text-slate-700">Quantity</label>
                        <Input 
                            type="number" 
                            value={newMove.quantity} 
                            onChange={(e) => setNewMove({...newMove, quantity: parseInt(e.target.value)})} 
                            required 
                        />
                    </div>
                    {activeTab === 'IN' && (
                        <>
                            <div>
                                <label className="block font-bold mb-1 text-sm text-slate-700">Vendor (Optional)</label>
                                <Select
                                    value={newMove.vendor_id || ''}
                                    onChange={(e) => setNewMove({...newMove, vendor_id: e.target.value})}
                                    className="w-full"
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors?.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1 text-sm text-slate-700">Destination Warehouse</label>
                                <Select
                                    value={newMove.dest_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, dest_warehouse_id: e.target.value})}
                                    className="w-full"
                                    required
                                >
                                    <option value="">Select Destination</option>
                                    {warehouses?.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </Select>
                            </div>
                        </>
                    )}
                    {activeTab === 'OUT' && (
                        <>
                            <div>
                                <label className="block font-bold mb-1 text-sm text-slate-700">Customer (Optional)</label>
                                <Select
                                    value={newMove.customer_id}
                                    onChange={(e) => setNewMove({...newMove, customer_id: e.target.value})}
                                    className="w-full"
                                >
                                    <option value="">Select Customer</option>
                                    {customers?.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1 text-sm text-slate-700">Source Warehouse</label>
                                <Select
                                    value={newMove.source_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, source_warehouse_id: e.target.value})}
                                    className="w-full"
                                    required
                                >
                                    <option value="">Select Source</option>
                                    {warehouses?.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </Select>
                            </div>
                        </>
                    )}
                    {activeTab === 'INT' && (
                        <>
                            <div>
                                <label className="block font-bold mb-1 text-sm text-slate-700">Source Warehouse</label>
                                <Select
                                    value={newMove.source_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, source_warehouse_id: e.target.value})}
                                    className="w-full"
                                    required
                                >
                                    <option value="">Select Source</option>
                                    {warehouses?.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1 text-sm text-slate-700">Destination Warehouse</label>
                                <Select
                                    value={newMove.dest_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, dest_warehouse_id: e.target.value})}
                                    className="w-full"
                                    required
                                >
                                    <option value="">Select Destination</option>
                                    {warehouses?.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </Select>
                            </div>
                        </>
                    )}
                    {activeTab === 'ADJ' && (
                        <div>
                            <label className="block font-bold mb-1 text-sm text-slate-700">Warehouse</label>
                            <Select
                                value={newMove.source_warehouse_id || newMove.dest_warehouse_id}
                                onChange={(e) => setNewMove({...newMove, source_warehouse_id: e.target.value, dest_warehouse_id: e.target.value})}
                                className="w-full"
                                required
                            >
                                <option value="">Select Warehouse</option>
                                {warehouses?.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                ))}
                            </Select>
                        </div>
                    )}
                    <Button type="submit" className="w-full mt-4">Create Draft</Button>
                </form>
            </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
            <div className="card overflow-hidden">
                <DataTable
                    columns={[
                        { header: 'Reference' },
                        { header: 'Product' },
                        { header: 'Qty' },
                        { header: 'Source' },
                        { header: 'Destination' },
                        { header: 'Status' },
                        { header: 'Actions' }
                    ]}
                    data={moves}
                    loading={loading}
                    emptyMessage="No moves found."
                    renderRow={(move) => {
                        const product = products.find(p => p.id === move.product_id);
                        const nextStatuses = getNextStatus(move.status);
                        return (
                            <tr key={move.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono font-bold text-indigo-600 text-sm">
                                    {move.reference || `#${move.id}`}
                                </td>
                                <td className="p-4 text-sm font-medium text-slate-700">{product?.name || `Product #${move.product_id}`}</td>
                                <td className="p-4 font-bold text-slate-900">{move.quantity}</td>
                                <td className="p-4 text-sm text-slate-500">
                                    {move.source_location || (move.source_warehouse_id ? `WH#${move.source_warehouse_id}` : '-')}
                                </td>
                                <td className="p-4 text-sm text-slate-500">
                                    {move.dest_location || (move.dest_warehouse_id ? `WH#${move.dest_warehouse_id}` : '-')}
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={move.status} />
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        <Button 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 rounded-full"
                                            onClick={() => openPrintDialog(move)}
                                            title="Print"
                                        >
                                            <Printer size={16} />
                                        </Button>
                                        {move.status === 'ready' && (
                                            <Button 
                                                variant="primary"
                                                className="h-8 text-xs py-1 px-3 bg-green-600 hover:bg-green-700 border-green-800"
                                                onClick={() => handleValidate(move.id)}
                                            >
                                                Validate
                                            </Button>
                                        )}
                                        {nextStatuses.map((nextStatus) => (
                                            <Button
                                                key={nextStatus}
                                                variant={nextStatus === 'cancelled' ? 'danger' : 'secondary'}
                                                className="h-8 text-xs py-1 px-3"
                                                onClick={() => handleStatusChange(move.id, nextStatus)}
                                            >
                                                {nextStatus === 'cancelled' ? 'Cancel' : `Mark ${nextStatus}`}
                                            </Button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        );
                    }}
                />
            </div>
        </div>
      </div>

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

export default Operations;
