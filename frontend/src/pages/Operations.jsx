import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
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
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
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
    fetchProducts();
    fetchWarehouses();
    fetchVendors();
    fetchCustomers();
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

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses/');
      setWarehouses(response.data);
    } catch (error) {
      console.error("Failed to fetch warehouses", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors/');
      setVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/');
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
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
      console.error("Failed to create move", error);
      alert("Failed to create move");
    }
  };

  const handleValidate = async (moveId) => {
    try {
      await api.post(`/operations/moves/${moveId}/validate`);
      fetchMoves();
    } catch (error) {
      console.error("Failed to validate move", error);
      alert("Failed to validate move (Check stock levels)");
    }
  };

  const handleStatusChange = async (moveId, newStatus) => {
    try {
      await api.post(`/operations/moves/${moveId}/status?new_status=${newStatus}`);
      fetchMoves();
    } catch (error) {
      console.error("Failed to update status", error);
      alert(error.response?.data?.detail || "Failed to update status");
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
      <h2 className="text-3xl font-black uppercase mb-8">Operations</h2>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setStatusFilter(''); // Reset status filter when changing tab
                    }}
                    className={`flex items-center gap-2 px-6 py-3 font-bold border-2 border-black transition-all ${
                        activeTab === tab.id 
                        ? `${tab.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]` 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                >
                    <Icon size={20} />
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
            <div className="neo-box p-6 sticky top-4">
                <h3 className="text-xl font-black mb-4 uppercase border-b-2 border-black pb-2">New {tabs.find(t => t.id === activeTab)?.label}</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block font-bold mb-1">Product</label>
                        <Select
                            value={newMove.product_id}
                            onChange={(e) => setNewMove({...newMove, product_id: e.target.value})}
                            className="w-full"
                            required
                        >
                            <option value="">Select Product</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Quantity</label>
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
                                <label className="block font-bold mb-1">Vendor (Optional)</label>
                                <Select
                                    value={newMove.vendor_id}
                                    onChange={(e) => setNewMove({...newMove, vendor_id: e.target.value})}
                                    className="w-full"
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Destination Warehouse</label>
                                <Select
                                    value={newMove.dest_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, dest_warehouse_id: e.target.value})}
                                    className="w-full"
                                    required
                                >
                                    <option value="">Select Destination</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </Select>
                            </div>
                        </>
                    )}
                    {activeTab === 'OUT' && (
                        <>
                            <div>
                                <label className="block font-bold mb-1">Customer (Optional)</label>
                                <Select
                                    value={newMove.customer_id}
                                    onChange={(e) => setNewMove({...newMove, customer_id: e.target.value})}
                                    className="w-full"
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Source Warehouse</label>
                                <Select
                                    value={newMove.source_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, source_warehouse_id: e.target.value})}
                                    className="w-full"
                                    required
                                >
                                    <option value="">Select Source</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </Select>
                            </div>
                        </>
                    )}
                    {activeTab === 'INT' && (
                        <>
                            <div>
                                <label className="block font-bold mb-1">Source Warehouse</label>
                                <Select
                                    value={newMove.source_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, source_warehouse_id: e.target.value})}
                                    className="w-full"
                                    required
                                >
                                    <option value="">Select Source</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Destination Warehouse</label>
                                <Select
                                    value={newMove.dest_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, dest_warehouse_id: e.target.value})}
                                    className="w-full"
                                    required
                                >
                                    <option value="">Select Destination</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </Select>
                            </div>
                        </>
                    )}
                    {activeTab === 'ADJ' && (
                        <div>
                            <label className="block font-bold mb-1">Warehouse</label>
                            <Select
                                value={newMove.source_warehouse_id || newMove.dest_warehouse_id}
                                onChange={(e) => setNewMove({...newMove, source_warehouse_id: e.target.value, dest_warehouse_id: e.target.value})}
                                className="w-full"
                                required
                            >
                                <option value="">Select Warehouse</option>
                                {warehouses.map(w => (
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
                        <tr key={move.id} className="border-b-2 border-black hover:bg-gray-50">
                            <td className="p-4 border-r-2 border-black font-mono font-bold">
                                {move.reference || `#${move.id}`}
                            </td>
                            <td className="p-4 border-r-2 border-black">{product?.name || `Product #${move.product_id}`}</td>
                            <td className="p-4 border-r-2 border-black font-bold">{move.quantity}</td>
                            <td className="p-4 border-r-2 border-black text-sm">
                                {move.source_location || (move.source_warehouse_id ? `WH#${move.source_warehouse_id}` : '-')}
                            </td>
                            <td className="p-4 border-r-2 border-black text-sm">
                                {move.dest_location || (move.dest_warehouse_id ? `WH#${move.dest_warehouse_id}` : '-')}
                            </td>
                            <td className="p-4 border-r-2 border-black">
                                <StatusBadge status={move.status} />
                            </td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-2">
                                    <Button 
                                        variant="secondary" 
                                        className="text-xs py-1 px-2 flex items-center gap-1"
                                        onClick={() => openPrintDialog(move)}
                                    >
                                        <Printer size={14} />
                                        Print
                                    </Button>
                                    {move.status === 'ready' && (
                                        <Button 
                                            variant="secondary" 
                                            className="text-xs py-1 px-2"
                                            onClick={() => handleValidate(move.id)}
                                        >
                                            Validate
                                        </Button>
                                    )}
                                    {nextStatuses.map((nextStatus) => (
                                        <Button
                                            key={nextStatus}
                                            variant="secondary"
                                            className="text-xs py-1 px-2"
                                            onClick={() => handleStatusChange(move.id, nextStatus)}
                                        >
                                            → {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
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
