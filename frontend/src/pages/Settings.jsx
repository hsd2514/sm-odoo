import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchBar from '../components/ui/SearchBar';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { User, Warehouse, Tag, Lock } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Warehouse state
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '' });
  const [warehouseSearch, setWarehouseSearch] = useState('');

  // Category state
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    } else if (activeTab === 'warehouses') {
      fetchWarehouses();
    } else if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [activeTab]);

  // Profile functions
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setProfile({ full_name: response.data.full_name, email: response.data.email });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const updateData = { full_name: profile.full_name };
      if (password) updateData.password = password;

      await api.put('/auth/me', updateData);
      setMessage('Profile updated successfully!');
      setPassword('');
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage('Failed to update profile.');
    }
  };

  // Warehouse functions
  const fetchWarehouses = async () => {
    try {
      setWarehouseLoading(true);
      const response = await api.get('/warehouses/');
      setWarehouses(response.data);
    } catch (error) {
      console.error("Failed to fetch warehouses", error);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await api.put(`/warehouses/${editingWarehouse.id}`, newWarehouse);
      } else {
        await api.post('/warehouses/', newWarehouse);
      }
      await fetchWarehouses();
      setWarehouseModalOpen(false);
      setNewWarehouse({ name: '', location: '' });
      setEditingWarehouse(null);
    } catch (error) {
      console.error("Failed to save warehouse", error);
      alert(error.response?.data?.detail || 'Failed to save warehouse');
    }
  };

  const handleWarehouseEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setNewWarehouse({ name: warehouse.name, location: warehouse.location });
    setWarehouseModalOpen(true);
  };

  const handleWarehouseDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await api.delete(`/warehouses/${id}`);
      await fetchWarehouses();
    } catch (error) {
      console.error("Failed to delete warehouse", error);
      alert(error.response?.data?.detail || 'Failed to delete warehouse');
    }
  };

  // Category functions
  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, newCategory);
      } else {
        await api.post('/categories/', newCategory);
      }
      await fetchCategories();
      setCategoryModalOpen(false);
      setNewCategory({ name: '', description: '' });
      setEditingCategory(null);
    } catch (error) {
      console.error("Failed to save category", error);
      alert(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, description: category.description || '' });
    setCategoryModalOpen(true);
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      await fetchCategories();
    } catch (error) {
      console.error("Failed to delete category", error);
      alert(error.response?.data?.detail || 'Failed to delete category');
    }
  };

  // Filter functions
  const filteredWarehouses = warehouses.filter(w => 
    w.name.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
    w.location.toLowerCase().includes(warehouseSearch.toLowerCase())
  );

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
    { id: 'categories', label: 'Categories', icon: Tag },
  ];

  if (loading && activeTab === 'profile') return <div>Loading Settings...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-black uppercase mb-8">Settings</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b-4 border-black">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-bold uppercase border-2 border-b-0 border-black flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="neo-box p-8 bg-white">
          <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2 border-b-2 border-black pb-2">
            <User /> Profile Settings
          </h3>

          {message && (
            <div className={`p-4 mb-6 font-bold border-2 border-black ${message.includes('success') ? 'bg-green-200' : 'bg-red-200'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">Email (Read-only)</label>
              <Input 
                value={profile.email} 
                disabled 
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Full Name</label>
              <Input 
                value={profile.full_name} 
                onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-2 flex items-center gap-2">
                <Lock size={16} /> New Password (Optional)
              </label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Leave blank to keep current"
              />
            </div>

            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </div>
      )}

      {/* Warehouses Tab */}
      {activeTab === 'warehouses' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase flex items-center gap-2">
              <Warehouse /> Warehouse Management
            </h3>
            <Button onClick={() => {
              setEditingWarehouse(null);
              setNewWarehouse({ name: '', location: '' });
              setWarehouseModalOpen(true);
            }}>
              + Add Warehouse
            </Button>
          </div>

          <div className="mb-4">
            <SearchBar
              placeholder="Search warehouses by name or location..."
              value={warehouseSearch}
              onChange={(e) => setWarehouseSearch(e.target.value)}
            />
          </div>

          <DataTable
            columns={[
              { header: 'Name' },
              { header: 'Location' },
              { header: 'Actions' }
            ]}
            data={filteredWarehouses}
            loading={warehouseLoading}
            emptyMessage="No warehouses found."
            renderRow={(warehouse) => (
              <tr key={warehouse.id} className="border-b-2 border-black hover:bg-gray-50">
                <td className="p-4 border-r-2 border-black font-bold">{warehouse.name}</td>
                <td className="p-4 border-r-2 border-black">{warehouse.location}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleWarehouseEdit(warehouse)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleWarehouseDelete(warehouse.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          />

          <Modal
            isOpen={warehouseModalOpen}
            onClose={() => {
              setWarehouseModalOpen(false);
              setEditingWarehouse(null);
              setNewWarehouse({ name: '', location: '' });
            }}
            title={editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
          >
            <form onSubmit={handleWarehouseSubmit} className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Name *</label>
                <Input
                  value={newWarehouse.name}
                  onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Location *</label>
                <Input
                  value={newWarehouse.location}
                  onChange={(e) => setNewWarehouse({...newWarehouse, location: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingWarehouse ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setWarehouseModalOpen(false);
                    setEditingWarehouse(null);
                    setNewWarehouse({ name: '', location: '' });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase flex items-center gap-2">
              <Tag /> Category Management
            </h3>
            <Button onClick={() => {
              setEditingCategory(null);
              setNewCategory({ name: '', description: '' });
              setCategoryModalOpen(true);
            }}>
              + Add Category
            </Button>
          </div>

          <div className="mb-4">
            <SearchBar
              placeholder="Search categories by name or description..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
          </div>

          <DataTable
            columns={[
              { header: 'Name' },
              { header: 'Description' },
              { header: 'Actions' }
            ]}
            data={filteredCategories}
            loading={categoryLoading}
            emptyMessage="No categories found."
            renderRow={(category) => (
              <tr key={category.id} className="border-b-2 border-black hover:bg-gray-50">
                <td className="p-4 border-r-2 border-black font-bold">{category.name}</td>
                <td className="p-4 border-r-2 border-black">{category.description || '-'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCategoryEdit(category)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleCategoryDelete(category.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          />

          <Modal
            isOpen={categoryModalOpen}
            onClose={() => {
              setCategoryModalOpen(false);
              setEditingCategory(null);
              setNewCategory({ name: '', description: '' });
            }}
            title={editingCategory ? 'Edit Category' : 'Add Category'}
          >
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Name *</label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Description</label>
                <Input
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setCategoryModalOpen(false);
                    setEditingCategory(null);
                    setNewCategory({ name: '', description: '' });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default Settings;
