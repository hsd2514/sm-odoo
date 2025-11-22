import React, { useEffect, useState } from 'react';
import { BarChart3, Package, ArrowDownLeft, ArrowUpRight, AlertTriangle, Filter, ArrowRightLeft, ClipboardCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';
import Input from '../components/ui/Input';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    low_stock: 0,
    incoming: 0,
    outgoing: 0,
    internal_transfers: 0,
    adjustments: 0
  });
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [moveTypeFilter, setMoveTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchStats();
    fetchWarehouses();
    fetchCategories();
    fetchProducts();
    fetchRecentMoves();
  }, [moveTypeFilter, statusFilter, warehouseFilter, categoryFilter]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (warehouseFilter) params.append('warehouse_id', warehouseFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const response = await api.get(`/auth/stats?${params.toString()}`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/');
      const uniqueCategories = [...new Set(response.data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Failed to fetch categories", error);
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

  const fetchRecentMoves = async () => {
    try {
      const response = await api.get('/operations/moves?limit=50');
      setMoves(response.data);
    } catch (error) {
      console.error("Failed to fetch moves", error);
    }
  };

  // Prepare chart data
  const getStockByCategoryData = () => {
    const categoryData = {};
    products.forEach(p => {
      if (!categoryData[p.category]) {
        categoryData[p.category] = { name: p.category, stock: 0, products: 0 };
      }
      categoryData[p.category].stock += p.current_stock;
      categoryData[p.category].products += 1;
    });
    return Object.values(categoryData);
  };

  const getMovesByTypeData = () => {
    const typeData = {
      'IN': 0,
      'OUT': 0,
      'INT': 0,
      'ADJ': 0
    };
    moves.forEach(m => {
      if (typeData[m.move_type] !== undefined) {
        typeData[m.move_type] += 1;
      }
    });
    return [
      { name: 'Receipts', value: typeData['IN'] },
      { name: 'Deliveries', value: typeData['OUT'] },
      { name: 'Transfers', value: typeData['INT'] },
      { name: 'Adjustments', value: typeData['ADJ'] }
    ];
  };

  const getTopProductsData = () => {
    return products
      .sort((a, b) => b.current_stock - a.current_stock)
      .slice(0, 5)
      .map(p => ({ name: p.name.substring(0, 15), stock: p.current_stock }));
  };

  const cards = [
    { title: 'Total Products', value: stats.total_products, icon: Package, color: 'bg-blue-200' },
    { title: 'Low Stock Alerts', value: stats.low_stock, icon: AlertTriangle, color: 'bg-red-200' },
    { title: 'Pending Receipts', value: stats.incoming, icon: ArrowDownLeft, color: 'bg-green-200' },
    { title: 'Pending Deliveries', value: stats.outgoing, icon: ArrowUpRight, color: 'bg-yellow-200' },
    { title: 'Internal Transfers', value: stats.internal_transfers, icon: ArrowRightLeft, color: 'bg-cyan-200' },
    { title: 'Adjustments', value: stats.adjustments, icon: ClipboardCheck, color: 'bg-gray-200' },
  ];

  if (loading) return <div>Loading Dashboard...</div>;

  return (
    <div>
      <h2 className="text-3xl font-black uppercase mb-8">Dashboard</h2>
      
      {/* Filters */}
      <div className="neo-box p-4 mb-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h3 className="text-lg font-black uppercase">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block font-bold mb-1 text-sm">Document Type</label>
            <select
              value={moveTypeFilter}
              onChange={(e) => setMoveTypeFilter(e.target.value)}
              className="neo-input w-full font-bold"
            >
              <option value="">All Types</option>
              <option value="IN">Receipts</option>
              <option value="OUT">Deliveries</option>
              <option value="INT">Internal Transfers</option>
              <option value="ADJ">Adjustments</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1 text-sm">Status</label>
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
          <div>
            <label className="block font-bold mb-1 text-sm">Warehouse</label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="neo-input w-full font-bold"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1 text-sm">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="neo-input w-full font-bold"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`neo-box p-6 ${card.color} flex items-center justify-between`}>
              <div>
                <p className="font-bold text-sm uppercase mb-1">{card.title}</p>
                <h3 className="text-4xl font-black">{card.value}</h3>
              </div>
              <Icon size={48} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="neo-box p-6 bg-white">
          <h3 className="text-xl font-black mb-4 uppercase flex items-center gap-2">
            <BarChart3 /> Stock by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getStockByCategoryData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#4ecdc4" stroke="#1a1a1a" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neo-box p-6 bg-white">
          <h3 className="text-xl font-black mb-4 uppercase">Moves by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMovesByTypeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ff6b6b" stroke="#1a1a1a" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neo-box p-6 bg-white">
          <h3 className="text-xl font-black mb-4 uppercase">Top 5 Products by Stock</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTopProductsData()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="stock" fill="#fdfd96" stroke="#1a1a1a" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neo-box p-6 bg-white">
          <h3 className="text-xl font-black mb-4 uppercase">Recent Activity</h3>
          <ul className="space-y-4">
            {moves.slice(0, 5).map((move) => (
              <li key={move.id} className="flex items-center justify-between border-b-2 border-black pb-2">
                <div>
                  <span className="font-bold">{move.reference || `#${move.id}`}</span>
                  <span className="text-sm text-gray-600 ml-2">{move.move_type}</span>
                </div>
                <span className="text-sm font-bold bg-gray-200 px-2 py-1 border-2 border-black">
                  {new Date(move.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
            {moves.length === 0 && (
              <li className="text-gray-500 italic">No recent activity</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
