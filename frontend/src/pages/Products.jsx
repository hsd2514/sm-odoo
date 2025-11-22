import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchBar from '../components/ui/SearchBar';
import Select from '../components/ui/Select';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Plus } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category_id: '', uom: '', initial_stock: 0, min_stock_level: '' });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
        (p.category_name && p.category_name.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const productData = { ...newProduct };
      if (!productData.category_id) {
        delete productData.category_id;
      }
      if (!productData.min_stock_level || productData.min_stock_level === '') {
        productData.min_stock_level = null;
      } else {
        productData.min_stock_level = parseInt(productData.min_stock_level);
      }
      await api.post('/products/', productData);
      setShowModal(false);
      setNewProduct({ name: '', sku: '', category_id: '', uom: '', initial_stock: 0, min_stock_level: '' });
      fetchProducts();
    } catch (error) {
      console.error("Failed to create product", error);
      alert(error.response?.data?.detail || "Failed to create product");
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
          { header: 'Min Level' },
          { header: 'UoM' }
        ]}
        data={filteredProducts}
        loading={loading}
        emptyMessage={searchQuery ? 'No products found matching your search.' : 'No products found.'}
        renderRow={(product) => {
          const isLowStock = product.min_stock_level !== null && product.min_stock_level !== undefined
            ? product.current_stock < product.min_stock_level
            : product.current_stock < 10;
          return (
            <tr key={product.id} className="border-b-2 border-black hover:bg-gray-50">
              <td className="p-4 border-r-2 border-black font-bold">{product.sku}</td>
              <td className="p-4 border-r-2 border-black">{product.name}</td>
              <td className="p-4 border-r-2 border-black">{product.category_name || product.category || '-'}</td>
              <td className={`p-4 border-r-2 border-black font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                {product.current_stock}
              </td>
              <td className="p-4 border-r-2 border-black">{product.min_stock_level ?? '-'}</td>
              <td className="p-4">{product.uom}</td>
            </tr>
          );
        }}
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
              <Select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">UoM</label>
              <Input value={newProduct.uom} onChange={e => setNewProduct({...newProduct, uom: e.target.value})} required />
            </div>
            <div>
              <label className="block font-bold mb-1">Initial Stock</label>
              <Input type="number" value={newProduct.initial_stock} onChange={e => setNewProduct({...newProduct, initial_stock: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          <div>
            <label className="block font-bold mb-1">Minimum Stock Level (Optional)</label>
            <Input 
              type="number" 
              value={newProduct.min_stock_level} 
              onChange={e => setNewProduct({...newProduct, min_stock_level: e.target.value ? parseInt(e.target.value) : null})} 
              placeholder="Leave empty to use default (10)"
            />
            <p className="text-sm text-gray-600 mt-1">Alert when stock falls below this level</p>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
