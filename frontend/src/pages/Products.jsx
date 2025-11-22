import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchBar from '../components/ui/SearchBar';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Plus } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', uom: '', initial_stock: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
      setFilteredProducts(response.data);
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

      <SearchBar
        placeholder="Search products by name, SKU, or category..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-8"
      />

      <DataTable
        columns={[
          { header: 'SKU' },
          { header: 'Name' },
          { header: 'Category' },
          { header: 'Stock' },
          { header: 'UoM' }
        ]}
        data={filteredProducts}
        loading={loading}
        emptyMessage={searchQuery ? 'No products found matching your search.' : 'No products found.'}
        renderRow={(product) => (
          <tr key={product.id} className="border-b-2 border-black hover:bg-gray-50">
            <td className="p-4 border-r-2 border-black font-bold">{product.sku}</td>
            <td className="p-4 border-r-2 border-black">{product.name}</td>
            <td className="p-4 border-r-2 border-black">{product.category}</td>
            <td className={`p-4 border-r-2 border-black font-bold ${product.current_stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
              {product.current_stock}
            </td>
            <td className="p-4">{product.uom}</td>
          </tr>
        )}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Product"
        footer={
          <Button type="submit" form="product-form" className="w-full">Create Product</Button>
        }
      >
        <form id="product-form" onSubmit={handleCreate} className="space-y-4">
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
        </form>
      </Modal>
    </div>
  );
};

export default Products;
