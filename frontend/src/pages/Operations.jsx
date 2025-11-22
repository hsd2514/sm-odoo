import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ArrowRightLeft, ArrowDownLeft, ArrowUpRight, ClipboardCheck } from 'lucide-react';

const Operations = () => {
  const [moves, setMoves] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('IN'); // IN, OUT, INT, ADJ
  const [newMove, setNewMove] = useState({ 
    product_id: '', 
    quantity: 0, 
    source_location: '', 
    dest_location: '',
    source_warehouse_id: '',
    dest_warehouse_id: ''
  });

  useEffect(() => {
    fetchMoves();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchMoves = async () => {
    try {
      const response = await api.get('/operations/moves');
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const moveData = { 
        ...newMove, 
        move_type: activeTab, 
        product_id: parseInt(newMove.product_id),
        source_warehouse_id: newMove.source_warehouse_id ? parseInt(newMove.source_warehouse_id) : null,
        dest_warehouse_id: newMove.dest_warehouse_id ? parseInt(newMove.dest_warehouse_id) : null
      };
      await api.post('/operations/moves', moveData);
      setNewMove({ 
        product_id: '', 
        quantity: 0, 
        source_location: '', 
        dest_location: '',
        source_warehouse_id: '',
        dest_warehouse_id: ''
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
                    onClick={() => setActiveTab(tab.id)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
            <div className="neo-box p-6 sticky top-4">
                <h3 className="text-xl font-black mb-4 uppercase border-b-2 border-black pb-2">New {tabs.find(t => t.id === activeTab)?.label}</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block font-bold mb-1">Product</label>
                        <select 
                            className="neo-input w-full bg-white"
                            value={newMove.product_id}
                            onChange={(e) => setNewMove({...newMove, product_id: e.target.value})}
                            required
                        >
                            <option value="">Select Product</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
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
                        <div>
                            <label className="block font-bold mb-1">Destination Warehouse</label>
                            <select 
                                className="neo-input w-full bg-white"
                                value={newMove.dest_warehouse_id}
                                onChange={(e) => setNewMove({...newMove, dest_warehouse_id: e.target.value})}
                                required
                            >
                                <option value="">Select Destination</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {activeTab === 'OUT' && (
                        <div>
                            <label className="block font-bold mb-1">Source Warehouse</label>
                            <select 
                                className="neo-input w-full bg-white"
                                value={newMove.source_warehouse_id}
                                onChange={(e) => setNewMove({...newMove, source_warehouse_id: e.target.value})}
                                required
                            >
                                <option value="">Select Source</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {activeTab === 'INT' && (
                        <>
                            <div>
                                <label className="block font-bold mb-1">Source Warehouse</label>
                                <select 
                                    className="neo-input w-full bg-white"
                                    value={newMove.source_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, source_warehouse_id: e.target.value})}
                                    required
                                >
                                    <option value="">Select Source</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Destination Warehouse</label>
                                <select 
                                    className="neo-input w-full bg-white"
                                    value={newMove.dest_warehouse_id}
                                    onChange={(e) => setNewMove({...newMove, dest_warehouse_id: e.target.value})}
                                    required
                                >
                                    <option value="">Select Destination</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                    {activeTab === 'ADJ' && (
                        <div>
                            <label className="block font-bold mb-1">Warehouse</label>
                            <select 
                                className="neo-input w-full bg-white"
                                value={newMove.source_warehouse_id || newMove.dest_warehouse_id} // For ADJ, it's either source or dest depending on positive/negative quantity
                                onChange={(e) => setNewMove({...newMove, source_warehouse_id: e.target.value, dest_warehouse_id: e.target.value})}
                                required
                            >
                                <option value="">Select Warehouse</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <Button type="submit" className="w-full mt-4">Create Draft</Button>
                </form>
            </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
            <div className="neo-box p-0 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-black">
                            <th className="p-4 font-black border-r-2 border-black">ID</th>
                            <th className="p-4 font-black border-r-2 border-black">Type</th>
                            <th className="p-4 font-black border-r-2 border-black">Product</th>
                            <th className="p-4 font-black border-r-2 border-black">Qty</th>
                            <th className="p-4 font-black border-r-2 border-black">Status</th>
                            <th className="p-4 font-black">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moves.filter(m => m.move_type === activeTab).map((move) => {
                            const product = products.find(p => p.id === move.product_id);
                            return (
                                <tr key={move.id} className="border-b-2 border-black hover:bg-gray-50">
                                    <td className="p-4 border-r-2 border-black font-mono">#{move.id}</td>
                                    <td className="p-4 border-r-2 border-black font-bold">{move.move_type}</td>
                                    <td className="p-4 border-r-2 border-black">{product?.name || move.product_id}</td>
                                    <td className="p-4 border-r-2 border-black font-bold">{move.quantity}</td>
                                    <td className="p-4 border-r-2 border-black">
                                        <span className={`px-2 py-1 font-bold text-xs border-2 border-black ${move.status === 'done' ? 'bg-green-200' : 'bg-gray-200'}`}>
                                            {move.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {move.status !== 'done' && (
                                            <Button 
                                                variant="secondary" 
                                                className="text-xs py-1 px-2"
                                                onClick={() => handleValidate(move.id)}
                                            >
                                                Validate
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {moves.filter(m => m.move_type === activeTab).length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500 italic">No moves found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Operations;
