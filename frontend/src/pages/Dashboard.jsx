import React, { useEffect, useState } from 'react';
import { BarChart3, Package, ArrowDownLeft, ArrowUpRight, AlertTriangle, Filter, ArrowRightLeft, ClipboardCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';
import { useWarehouses, useCategories, useProducts } from '../hooks/useApiData';
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
  const { data: warehouses } = useWarehouses();
  const { data: categoriesData } = useCategories();
  const { data: products } = useProducts();
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [moveTypeFilter, setMoveTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Map categories to names for compatibility
  const categories = categoriesData?.map(c => c.name) || [];

  useEffect(() => {
    fetchStats();
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


  const fetchRecentMoves = async () => {
    try {
      const response = await api.get('/operations/moves?limit=50');
      setMoves(response.data);
    } catch (error) {
      // Silently fail for moves - not critical for dashboard
    }
  };

  // Prepare chart data
  const getStockByCategoryData = () => {
    const categoryData = {};
    products.forEach(p => {
      const catName = p.category_name || p.category || 'Uncategorized';
      if (!categoryData[catName]) {
        categoryData[catName] = { name: catName, stock: 0, products: 0 };
      }
      categoryData[catName].stock += p.current_stock;
      categoryData[catName].products += 1;
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-slate-600 font-medium mt-1">Overview of your inventory performance</p>
        </div>
        <div className="text-sm font-bold bg-white px-3 py-1 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Filters */}
      <div className="card p-5 mb-8">
        <div className="flex items-center gap-2 mb-4 text-indigo-600">
          <Filter size={20} />
          <h3 className="text-lg font-black uppercase">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block font-bold mb-1 text-sm text-slate-700">Document Type</label>
            <select
              value={moveTypeFilter}
              onChange={(e) => setMoveTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="IN">Receipts</option>
              <option value="OUT">Deliveries</option>
              <option value="INT">Internal Transfers</option>
              <option value="ADJ">Adjustments</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1 text-sm text-slate-700">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
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
            <label className="block font-bold mb-1 text-sm text-slate-700">Warehouse</label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1 text-sm text-slate-700">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
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
            <div key={index} className="card p-6 flex items-center justify-between hover:-translate-y-1 transition-transform">
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">{card.title}</p>
                <h3 className="text-4xl font-black text-slate-900">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] ${card.color}`}>
                <Icon size={24} className="text-slate-900" strokeWidth={2} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2">
            <BarChart3 className="text-indigo-600" /> Stock by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getStockByCategoryData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '2px solid #0f172a', boxShadow: '4px 4px 0px 0px #0f172a' }}
              />
              <Legend />
              <Bar dataKey="stock" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-black mb-6 uppercase">Moves by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMovesByTypeData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '2px solid #0f172a', boxShadow: '4px 4px 0px 0px #0f172a' }}
              />
              <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-black mb-6 uppercase">Top 5 Products by Stock</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTopProductsData()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{fontSize: 12}} />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '2px solid #0f172a', boxShadow: '4px 4px 0px 0px #0f172a' }}
              />
              <Bar dataKey="stock" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-black mb-6 uppercase">Recent Activity</h3>
          <ul className="space-y-3">
            {moves.slice(0, 5).map((move) => (
              <li key={move.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    move.move_type === 'IN' ? 'bg-green-500' : 
                    move.move_type === 'OUT' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <span className="font-bold block text-sm">{move.reference || `#${move.id}`}</span>
                    <span className="text-xs text-slate-500 font-medium">{move.move_type}</span>
                  </div>
                </div>
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                  {new Date(move.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
            {moves.length === 0 && (
              <li className="text-slate-500 italic text-center py-4">No recent activity</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
