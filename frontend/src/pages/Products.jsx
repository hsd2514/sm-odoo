import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useProducts, useCategories } from '../hooks/useApiData';
import { handleApiError, confirmAction } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchBar from '../components/ui/SearchBar';
import Select from '../components/ui/Select';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

const Products = () => {
  const { data: products, loading, refetch: refetchProducts } = useProducts();
  const { data: categories } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category_id: '', uom: '', initial_stock: 0, min_stock_level: '' });
  const [stockLocations, setStockLocations] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.category_name && p.category_name.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
  }, [searchQuery, products]);

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
      setEditingProduct(null);
      setNewProduct({ name: '', sku: '', category_id: '', uom: '', initial_stock: 0, min_stock_level: '' });
      refetchProducts();
    } catch (error) {
      handleApiError(error, "Failed to create product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id || '',
      uom: product.uom,
      initial_stock: product.current_stock,
      min_stock_level: product.min_stock_level || ''
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const productData = { ...newProduct };
      if (!productData.category_id) {
        productData.category_id = null;
      }
      if (!productData.min_stock_level || productData.min_stock_level === '') {
        productData.min_stock_level = null;
      } else {
        productData.min_stock_level = parseInt(productData.min_stock_level);
      }
      // Remove initial_stock from update (it's not in ProductUpdate schema)
      delete productData.initial_stock;
      await api.put(`/products/${editingProduct.id}`, productData);
      setShowModal(false);
      setEditingProduct(null);
      setNewProduct({ name: '', sku: '', category_id: '', uom: '', initial_stock: 0, min_stock_level: '' });
      refetchProducts();
    } catch (error) {
      handleApiError(error, "Failed to update product");
    }
  };

  const handleDelete = async (productId) => {
    if (!confirmAction('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/products/${productId}`);
      refetchProducts();
    } catch (error) {
      handleApiError(error, "Failed to delete product");
    }
  };

  const fetchStockLocations = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/stock-locations`);
      setStockLocations(response.data);
      setShowStockModal(true);
    } catch (error) {
      handleApiError(error, "Failed to fetch stock locations");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black uppercase">Products</h2>
        <Button onClick={() => {
          setEditingProduct(null);
          setNewProduct({ name: '', sku: '', category_id: '', uom: '', initial_stock: 0, min_stock_level: '' });
          setShowModal(true);
        }} className="flex items-center gap-2">
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
          { header: 'UoM' },
          { header: 'Actions' }
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
              <td className="p-4 border-r-2 border-black">{product.uom}</td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchStockLocations(product.id)}
                    className="p-2 hover:bg-green-100 border-2 border-black font-bold"
                    title="View Stock Locations"
                  >
                    <MapPin size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 hover:bg-blue-100 border-2 border-black font-bold"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 hover:bg-red-100 border-2 border-black font-bold"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
          setNewProduct({ name: '', sku: '', category_id: '', uom: '', initial_stock: 0, min_stock_level: '' });
        }}
        title={editingProduct ? 'Edit Product' : 'New Product'}
        footer={
          <Button type="submit" form="product-form" className="w-full">
            {editingProduct ? 'Update Product' : 'Create Product'}
          </Button>
        }
      >
        <form id="product-form" onSubmit={editingProduct ? handleUpdate : handleCreate} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">Name</label>
            <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">SKU</label>
              <Input 
                value={newProduct.sku} 
                onChange={e => setNewProduct({...newProduct, sku: e.target.value})} 
                required 
                disabled={!!editingProduct}
              />
              {editingProduct && <p className="text-xs text-gray-500 mt-1">SKU cannot be changed</p>}
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
              <label className="block font-bold mb-1">{editingProduct ? 'Current Stock' : 'Initial Stock'}</label>
              <Input 
                type="number" 
                value={newProduct.initial_stock} 
                onChange={e => setNewProduct({...newProduct, initial_stock: parseInt(e.target.value) || 0})}
                disabled={!!editingProduct}
              />
              {editingProduct && <p className="text-xs text-gray-500 mt-1">Stock is managed through operations</p>}
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

      <Modal
        isOpen={showStockModal}
        onClose={() => {
          setShowStockModal(false);
          setStockLocations(null);
        }}
        title={stockLocations ? `Stock Locations - ${stockLocations.product_name}` : 'Stock Locations'}
      >
        {stockLocations && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 border-2 border-black">
              <div className="font-bold text-lg">Total Stock: {stockLocations.total_stock}</div>
            </div>
            {stockLocations.stock_by_location && stockLocations.stock_by_location.length > 0 ? (
              <div className="space-y-2">
                {stockLocations.stock_by_location.map((location, idx) => (
                  <div key={idx} className="p-4 border-2 border-black">
                    <div className="font-bold text-lg">{location.warehouse_name}</div>
                    <div className="text-sm text-gray-600">{location.warehouse_location}</div>
                    <div className="text-xl font-bold mt-2">Stock: {location.quantity}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">
                No stock locations found. Stock is tracked at product level only.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Products;
