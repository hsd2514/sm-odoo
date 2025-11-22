import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Search } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', uom: '', initial_stock: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/', newProduct);
      setShowModal(false);
      setNewProduct({ name: '', sku: '', category: '', uom: '', initial_stock: 0 });
      fetchProducts();
    } catch (error) {
      console.error("Failed to create product", error);
      alert("Failed to create product");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black uppercase">Products</h2>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus size={20} /> Add Product
        </Button>
      </div>

      <div className="neo-box p-4 mb-8 flex items-center gap-4">
        <Search size={24} />
        <Input placeholder="Search products by name or SKU..." className="border-none shadow-none focus:shadow-none" />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="neo-box overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-neo-accent)] border-b-2 border-black">
                <th className="p-4 font-black border-r-2 border-black">SKU</th>
                <th className="p-4 font-black border-r-2 border-black">Name</th>
                <th className="p-4 font-black border-r-2 border-black">Category</th>
                <th className="p-4 font-black border-r-2 border-black">Stock</th>
                <th className="p-4 font-black">UoM</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b-2 border-black hover:bg-gray-50">
                  <td className="p-4 border-r-2 border-black font-bold">{product.sku}</td>
                  <td className="p-4 border-r-2 border-black">{product.name}</td>
                  <td className="p-4 border-r-2 border-black">{product.category}</td>
                  <td className={`p-4 border-r-2 border-black font-bold ${product.current_stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {product.current_stock}
                  </td>
                  <td className="p-4">{product.uom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="neo-box p-8 w-full max-w-lg relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 font-bold text-xl hover:text-red-500"
            >
              X
            </button>
            <h3 className="text-2xl font-black mb-6 uppercase">New Product</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Name</label>
                <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">SKU</label>
                  <Input value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} required />
                </div>
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <Input value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">UoM</label>
                  <Input value={newProduct.uom} onChange={e => setNewProduct({...newProduct, uom: e.target.value})} required />
                </div>
                <div>
                  <label className="block font-bold mb-1">Initial Stock</label>
                  <Input type="number" value={newProduct.initial_stock} onChange={e => setNewProduct({...newProduct, initial_stock: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full">Create Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
