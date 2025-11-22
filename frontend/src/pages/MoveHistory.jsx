import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SearchBar from '../components/ui/SearchBar';
import FilterBar from '../components/ui/FilterBar';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, ClipboardCheck } from 'lucide-react';

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


  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          { header: 'Date' }
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
              <td className="p-4 text-sm">{formatDate(move.created_at)}</td>
            </tr>
          );
        }}
      />
    </div>
  );
};

export default MoveHistory;

