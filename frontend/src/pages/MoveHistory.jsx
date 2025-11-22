import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Input from '../components/ui/Input';
import { Search, Filter, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, ClipboardCheck } from 'lucide-react';

const MoveHistory = () => {
  const [moves, setMoves] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moveTypeFilter, setMoveTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  useEffect(() => {
    fetchMoves();
    fetchProducts();
    fetchWarehouses();
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

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-200',
      'waiting': 'bg-yellow-200',
      'ready': 'bg-blue-200',
      'done': 'bg-green-200',
      'cancelled': 'bg-red-200'
    };
    return colors[status] || 'bg-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h2 className="text-3xl font-black uppercase mb-8">Move History</h2>

      {/* Search and Filters */}
      <div className="neo-box p-4 mb-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h3 className="text-lg font-black uppercase">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <Input 
              placeholder="Search by reference, source, or destination..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select
              value={moveTypeFilter}
              onChange={(e) => setMoveTypeFilter(e.target.value)}
              className="neo-input w-full font-bold"
            >
              <option value="">All Types</option>
              <option value="IN">Receipts</option>
              <option value="OUT">Deliveries</option>
              <option value="INT">Transfers</option>
              <option value="ADJ">Adjustments</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="neo-input w-full font-bold"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Moves Table */}
      {loading ? (
        <div className="neo-box p-8 text-center">Loading...</div>
      ) : (
        <div className="neo-box overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black">
                <th className="p-4 font-black border-r-2 border-black">Reference</th>
                <th className="p-4 font-black border-r-2 border-black">Type</th>
                <th className="p-4 font-black border-r-2 border-black">Product</th>
                <th className="p-4 font-black border-r-2 border-black">Quantity</th>
                <th className="p-4 font-black border-r-2 border-black">From</th>
                <th className="p-4 font-black border-r-2 border-black">To</th>
                <th className="p-4 font-black border-r-2 border-black">Status</th>
                <th className="p-4 font-black">Date</th>
              </tr>
            </thead>
            <tbody>
              {moves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500 italic">No moves found.</td>
                </tr>
              ) : (
                moves.map((move) => {
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
                        <span className={`px-2 py-1 font-bold text-xs border-2 border-black ${getStatusColor(move.status)}`}>
                          {move.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{formatDate(move.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MoveHistory;

