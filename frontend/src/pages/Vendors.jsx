import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorForm, setVendorForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    notes: ''
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVendors(vendors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = vendors.filter(v => 
        v.name.toLowerCase().includes(query) ||
        (v.email && v.email.toLowerCase().includes(query)) ||
        (v.phone && v.phone.includes(query))
      );
      setFilteredVendors(filtered);
    }
  }, [searchQuery, vendors]);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors/');
      setVendors(response.data);
      setFilteredVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await api.put(`/vendors/${editingVendor.id}`, vendorForm);
      } else {
        await api.post('/vendors/', vendorForm);
      }
      setShowModal(false);
      setEditingVendor(null);
      setVendorForm({ name: '', email: '', phone: '', address: '', contact_person: '', notes: '' });
      fetchVendors();
    } catch (error) {
      console.error("Failed to save vendor", error);
      alert("Failed to save vendor");
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setVendorForm({
      name: vendor.name,
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      contact_person: vendor.contact_person || '',
      notes: vendor.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await api.delete(`/vendors/${id}`);
      fetchVendors();
    } catch (error) {
      console.error("Failed to delete vendor", error);
      alert("Failed to delete vendor");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black uppercase">Vendors & Suppliers</h2>
        <Button onClick={() => {
          setEditingVendor(null);
          setVendorForm({ name: '', email: '', phone: '', address: '', contact_person: '', notes: '' });
          setShowModal(true);
        }} className="flex items-center gap-2">
          <Plus size={20} /> Add Vendor
        </Button>
      </div>

      <div className="neo-box p-4 mb-8 flex items-center gap-4 bg-white">
        <Search size={24} className="flex-shrink-0" />
        <Input 
          placeholder="Search vendors by name, email, or phone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1" 
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="neo-box overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-neo-accent)] border-b-2 border-black">
                <th className="p-4 font-black border-r-2 border-black">Name</th>
                <th className="p-4 font-black border-r-2 border-black">Contact</th>
                <th className="p-4 font-black border-r-2 border-black">Phone</th>
                <th className="p-4 font-black border-r-2 border-black">Address</th>
                <th className="p-4 font-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 italic">
                    {searchQuery ? 'No vendors found matching your search.' : 'No vendors found.'}
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b-2 border-black hover:bg-gray-50">
                    <td className="p-4 border-r-2 border-black font-bold">{vendor.name}</td>
                    <td className="p-4 border-r-2 border-black">
                      <div className="text-sm">
                        {vendor.email && <div>{vendor.email}</div>}
                        {vendor.contact_person && <div className="text-gray-600">{vendor.contact_person}</div>}
                      </div>
                    </td>
                    <td className="p-4 border-r-2 border-black">{vendor.phone || '-'}</td>
                    <td className="p-4 border-r-2 border-black text-sm">{vendor.address || '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="p-2 hover:bg-blue-100 border-2 border-black font-bold"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="p-2 hover:bg-red-100 border-2 border-black font-bold"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="neo-box p-8 w-full max-w-lg relative bg-white">
            <button 
              onClick={() => {
                setShowModal(false);
                setEditingVendor(null);
              }}
              className="absolute top-4 right-4 font-bold text-xl hover:text-red-500"
            >
              X
            </button>
            <h3 className="text-2xl font-black mb-6 uppercase">
              {editingVendor ? 'Edit Vendor' : 'New Vendor'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Name *</label>
                <Input 
                  value={vendorForm.name} 
                  onChange={e => setVendorForm({...vendorForm, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Email</label>
                  <Input 
                    type="email"
                    value={vendorForm.email} 
                    onChange={e => setVendorForm({...vendorForm, email: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Phone</label>
                  <Input 
                    value={vendorForm.phone} 
                    onChange={e => setVendorForm({...vendorForm, phone: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Contact Person</label>
                <Input 
                  value={vendorForm.contact_person} 
                  onChange={e => setVendorForm({...vendorForm, contact_person: e.target.value})} 
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Address</label>
                <Input 
                  value={vendorForm.address} 
                  onChange={e => setVendorForm({...vendorForm, address: e.target.value})} 
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Notes</label>
                <textarea
                  value={vendorForm.notes}
                  onChange={e => setVendorForm({...vendorForm, notes: e.target.value})}
                  className="neo-input w-full"
                  rows="3"
                />
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full">
                  {editingVendor ? 'Update Vendor' : 'Create Vendor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;

