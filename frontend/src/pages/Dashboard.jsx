import React, { useEffect, useState } from 'react';
import { BarChart3, Package, ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    low_stock: 0,
    incoming: 0,
    outgoing: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/auth/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Products', value: stats.total_products, icon: Package, color: 'bg-blue-200' },
    { title: 'Low Stock Alerts', value: stats.low_stock, icon: AlertTriangle, color: 'bg-red-200' },
    { title: 'Incoming Orders', value: stats.incoming, icon: ArrowDownLeft, color: 'bg-green-200' },
    { title: 'Outgoing Orders', value: stats.outgoing, icon: ArrowUpRight, color: 'bg-yellow-200' },
  ];

  if (loading) return <div>Loading Dashboard...</div>;

  return (
    <div>
      <h2 className="text-3xl font-black uppercase mb-8">Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Recent Activity Placeholder - To be implemented with real history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="neo-box p-6 bg-white">
          <h3 className="text-xl font-black mb-4 uppercase flex items-center gap-2">
            <BarChart3 /> Stock Trends
          </h3>
          <div className="h-64 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
            <span className="font-bold text-gray-400">Chart Visualization Coming Soon</span>
          </div>
        </div>

        <div className="neo-box p-6 bg-white">
          <h3 className="text-xl font-black mb-4 uppercase">Recent Activity</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
                <span>System Initialized</span>
                <span className="text-sm font-bold bg-gray-200 px-2 py-1">Just now</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
