import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchBar from '../components/ui/SearchBar';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.phone && c.phone.includes(query))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/');
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, customerForm);
      } else {
        await api.post('/customers/', customerForm);
      }
      setShowModal(false);
      setEditingCustomer(null);
      setCustomerForm({ name: '', email: '', phone: '', address: '', contact_person: '', notes: '' });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to save customer", error);
      alert("Failed to save customer");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      contact_person: customer.contact_person || '',
      notes: customer.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer", error);
      alert("Failed to delete customer");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black uppercase">Customers</h2>
        <Button onClick={() => {
          setEditingCustomer(null);
          setCustomerForm({ name: '', email: '', phone: '', address: '', contact_person: '', notes: '' });
          setShowModal(true);
        }} className="flex items-center gap-2">
          <Plus size={20} /> Add Customer
        </Button>
      </div>

      <SearchBar
        placeholder="Search customers by name, email, or phone..."
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
        data={filteredCustomers}
        loading={loading}
        emptyMessage={searchQuery ? 'No customers found matching your search.' : 'No customers found.'}
        renderRow={(customer) => (
          <tr key={customer.id} className="border-b-2 border-black hover:bg-gray-50">
            <td className="p-4 border-r-2 border-black font-bold">{customer.name}</td>
            <td className="p-4 border-r-2 border-black">
              <div className="text-sm">
                {customer.email && <div>{customer.email}</div>}
                {customer.contact_person && <div className="text-gray-600">{customer.contact_person}</div>}
              </div>
            </td>
            <td className="p-4 border-r-2 border-black">{customer.phone || '-'}</td>
            <td className="p-4 border-r-2 border-black text-sm">{customer.address || '-'}</td>
            <td className="p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(customer)}
                  className="p-2 hover:bg-blue-100 border-2 border-black font-bold"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
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
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
        footer={
          <Button type="submit" form="customer-form" className="w-full">
            {editingCustomer ? 'Update Customer' : 'Create Customer'}
          </Button>
        }
      >
        <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">Name *</label>
            <Input 
              value={customerForm.name} 
              onChange={e => setCustomerForm({...customerForm, name: e.target.value})} 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Email</label>
              <Input 
                type="email"
                value={customerForm.email} 
                onChange={e => setCustomerForm({...customerForm, email: e.target.value})} 
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Phone</label>
              <Input 
                value={customerForm.phone} 
                onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} 
              />
            </div>
          </div>
          <div>
            <label className="block font-bold mb-1">Contact Person</label>
            <Input 
              value={customerForm.contact_person} 
              onChange={e => setCustomerForm({...customerForm, contact_person: e.target.value})} 
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Address</label>
            <Input 
              value={customerForm.address} 
              onChange={e => setCustomerForm({...customerForm, address: e.target.value})} 
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Notes</label>
            <textarea
              value={customerForm.notes}
              onChange={e => setCustomerForm({...customerForm, notes: e.target.value})}
              className="neo-input w-full"
              rows="3"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;

