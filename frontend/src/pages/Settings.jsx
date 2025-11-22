import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useWarehouses, useCategories } from '../hooks/useApiData';
import { useCrudOperations } from '../utils/crudHelpers';
import { handleApiError, confirmAction } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchBar from '../components/ui/SearchBar';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { User, Warehouse, Tag, Lock, Plus, Trash2, Edit2 } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Warehouse state
  const shouldFetchWarehouses = activeTab === 'warehouses';
  const { data: warehouses, loading: warehouseLoading, refetch: refetchWarehouses } = useWarehouses([shouldFetchWarehouses]);
  const { create: createWarehouse, update: updateWarehouse, remove: removeWarehouse } = useCrudOperations('/warehouses/', refetchWarehouses);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '' });
  const [warehouseSearch, setWarehouseSearch] = useState('');

  // Category state
  const shouldFetchCategories = activeTab === 'categories';
  const { data: categories, loading: categoryLoading, refetch: refetchCategories } = useCategories([shouldFetchCategories]);
  const { create: createCategory, update: updateCategory, remove: removeCategory } = useCrudOperations('/categories/', refetchCategories);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
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
  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    const result = editingWarehouse 
      ? await updateWarehouse(editingWarehouse.id, newWarehouse)
      : await createWarehouse(newWarehouse);
    
    if (result.success) {
      setWarehouseModalOpen(false);
      setNewWarehouse({ name: '', location: '' });
      setEditingWarehouse(null);
    }
  };

  const handleWarehouseEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setNewWarehouse({ name: warehouse.name, location: warehouse.location });
    setWarehouseModalOpen(true);
  };

  const handleWarehouseDelete = async (id) => {
    await removeWarehouse(id, 'Are you sure you want to delete this warehouse?');
  };

  // Category functions
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const result = editingCategory 
      ? await updateCategory(editingCategory.id, newCategory)
      : await createCategory(newCategory);
    
    if (result.success) {
      setCategoryModalOpen(false);
      setNewCategory({ name: '', description: '' });
      setEditingCategory(null);
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, description: category.description || '' });
    setCategoryModalOpen(true);
  };

  const handleCategoryDelete = async (id) => {
    await removeCategory(id, 'Are you sure you want to delete this category?');
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
      <h2 className="text-3xl font-black uppercase mb-8 text-slate-900">Settings</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-t-lg transition-all border-b-2 ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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
        <div className="card p-8 max-w-2xl">
          <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2 border-b border-slate-100 pb-4 text-slate-800">
            <User className="text-indigo-600" /> Profile Settings
          </h3>

          {message && (
            <div className={`p-4 mb-6 font-bold rounded-lg border ${message.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block font-bold mb-2 text-sm text-slate-700">Email (Read-only)</label>
              <Input 
                value={profile.email} 
                disabled 
                className="bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-slate-700">Full Name</label>
              <Input 
                value={profile.full_name} 
                onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-slate-700 flex items-center gap-2">
                <Lock size={16} /> New Password (Optional)
              </label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Leave blank to keep current"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Warehouses Tab */}
      {activeTab === 'warehouses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-black uppercase text-slate-800">Warehouses</h3>
              <p className="text-slate-500 text-sm font-medium">Manage your physical storage locations</p>
            </div>
            <Button onClick={() => {
              setEditingWarehouse(null);
              setNewWarehouse({ name: '', location: '' });
              setWarehouseModalOpen(true);
            }}>
              <Plus size={18} /> Add Warehouse
            </Button>
          </div>

          <div className="card p-1">
            <div className="p-4 border-b border-slate-100">
              <SearchBar
                placeholder="Search warehouses..."
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
                <tr key={warehouse.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{warehouse.name}</td>
                  <td className="p-4 text-slate-600">{warehouse.location}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleWarehouseEdit(warehouse)}
                        className="h-8 w-8 p-0 rounded-full flex items-center justify-center"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleWarehouseDelete(warehouse.id)}
                        className="h-8 w-8 p-0 rounded-full flex items-center justify-center bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 shadow-none"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>

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
                <label className="block font-bold mb-2 text-sm text-slate-700">Name *</label>
                <Input
                  value={newWarehouse.name}
                  onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})}
                  required
                  placeholder="e.g. Main Distribution Center"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 text-sm text-slate-700">Location *</label>
                <Input
                  value={newWarehouse.location}
                  onChange={(e) => setNewWarehouse({...newWarehouse, location: e.target.value})}
                  required
                  placeholder="e.g. New York, NY"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setWarehouseModalOpen(false);
                    setEditingWarehouse(null);
                    setNewWarehouse({ name: '', location: '' });
                  }}
                  className="flex-1"
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-black uppercase text-slate-800">Categories</h3>
              <p className="text-slate-500 text-sm font-medium">Organize your products</p>
            </div>
            <Button onClick={() => {
              setEditingCategory(null);
              setNewCategory({ name: '', description: '' });
              setCategoryModalOpen(true);
            }}>
              <Plus size={18} /> Add Category
            </Button>
          </div>

          <div className="card p-1">
            <div className="p-4 border-b border-slate-100">
              <SearchBar
                placeholder="Search categories..."
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
                <tr key={category.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{category.name}</td>
                  <td className="p-4 text-slate-600">{category.description || '-'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleCategoryEdit(category)}
                        className="h-8 w-8 p-0 rounded-full flex items-center justify-center"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleCategoryDelete(category.id)}
                        className="h-8 w-8 p-0 rounded-full flex items-center justify-center bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 shadow-none"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>

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
                <label className="block font-bold mb-2 text-sm text-slate-700">Name *</label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  required
                  placeholder="e.g. Electronics"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 text-sm text-slate-700">Description</label>
                <Input
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setCategoryModalOpen(false);
                    setEditingCategory(null);
                    setNewCategory({ name: '', description: '' });
                  }}
                  className="flex-1"
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
