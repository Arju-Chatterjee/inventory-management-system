import { useEffect, useState } from 'react';
import { supplierService } from '../services/supplierService';

export const Suppliers = () => {
  const emptyForm = {
    name: '',
    phone: '',
    email: '',
    address: ''
  };

  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadSuppliers = async () => {
    try {
      const res = await supplierService.getAll();
      setSuppliers(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load suppliers');
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await supplierService.update(editingId, form);
        setEditingId(null);
      } else {
        await supplierService.create(form);
      }

      setForm(emptyForm);
      loadSuppliers();

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Error saving supplier — check backend terminal');
    }
  };

  const handleEdit = (supplier) => {
    setForm({
      name: supplier.name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setEditingId(supplier._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete supplier?')) return;

    await supplierService.remove(id);
    loadSuppliers();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Suppliers</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border rounded px-3 py-2" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input className="border rounded px-3 py-2" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <input className="border rounded px-3 py-2" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input className="border rounded px-3 py-2 md:col-span-2" name="address" placeholder="Address" value={form.address} onChange={handleChange} />

          <div className="flex gap-3 mt-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">
              {editingId ? 'Update Supplier' : 'Add Supplier'}
            </button>

            {editingId && (
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Address</th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={s._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.phone}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.address}</td>
                <td className="p-3 text-center space-x-2">
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" onClick={() => handleDelete(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};