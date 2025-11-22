import React, { useState, useEffect, useMemo } from 'react';
import { useVendors } from '../hooks/useApiData';
import { useCrudOperations } from '../utils/crudHelpers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchBar from '../components/ui/SearchBar';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Vendors = () => {
  const { data: vendors, loading, refetch } = useVendors();
  const { create, update, remove } = useCrudOperations('/vendors/', refetch);
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

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const query = searchQuery.toLowerCase();
    return vendors.filter(v => 
      v.name.toLowerCase().includes(query) ||
      (v.email && v.email.toLowerCase().includes(query)) ||
      (v.phone && v.phone.includes(query))
    );
  }, [searchQuery, vendors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = editingVendor 
      ? await update(editingVendor.id, vendorForm)
      : await create(vendorForm);
    
    if (result.success) {
      setShowModal(false);
      setEditingVendor(null);
      setVendorForm({ name: '', email: '', phone: '', address: '', contact_person: '', notes: '' });
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
    await remove(id, "Are you sure you want to delete this vendor?");
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

      <SearchBar
        placeholder="Search vendors by name, email, or phone..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-8"
      />

      <DataTable
        columns={[
          { header: 'Name' },
          { header: 'Contact' },
          { header: 'Phone' },
          { header: 'Address' },
          { header: 'Actions' }
        ]}
        data={filteredVendors}
        loading={loading}
        emptyMessage={searchQuery ? 'No vendors found matching your search.' : 'No vendors found.'}
        renderRow={(vendor) => (
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
        )}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingVendor(null);
        }}
        title={editingVendor ? 'Edit Vendor' : 'New Vendor'}
        footer={
          <Button type="submit" form="vendor-form" className="w-full">
            {editingVendor ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        }
      >
        <form id="vendor-form" onSubmit={handleSubmit} className="space-y-4">
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
        </form>
      </Modal>
    </div>
  );
};

export default Vendors;

