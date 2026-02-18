import { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { supplierService } from '../services/supplierService';

export const Products = () => {

  const LOW_STOCK_LIMIT = 5;

  const emptyForm = {
    name: '',
    sku: '',
    description: '',
    category: '',
    supplier: '',
    quantity: '',
    minStockLevel: 10
  };

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    const p = await productService.getAll();
    const c = await categoryService.getAll();
    const s = await supplierService.getAll();

    setProducts(p.data.data || p.data);
    setCategories(c.data.data || c.data);
    setSuppliers(s.data.data || s.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      if (editingId) {
        await productService.update(editingId, form);
        setEditingId(null);
      } else {
        await productService.create(form);
      }

      setForm(emptyForm);
      loadData();

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Error saving product');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      category: product.category?._id || '',
      supplier: product.supplier?._id || '',
      quantity: product.quantity || '',
      minStockLevel: product.minStockLevel || 10
    });

    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete product?')) return;
    await productService.remove(id);
    loadData();
  };

  const getRowColor = (p) => {
    if (p.quantity === 0) return '#ffcccc';
    if (p.quantity <= LOW_STOCK_LIMIT) return '#fff3cd';
    return 'transparent';
  };

  const getStatus = (p) => {
    if (p.quantity === 0) return 'Out of Stock';
    if (p.quantity <= LOW_STOCK_LIMIT) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h2>

        {/* FIXED GRID (2 columns only) */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <input className="border rounded px-3 py-2" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input className="border rounded px-3 py-2" name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />

          {/* textarea span adjusted */}
          <textarea
            className="border rounded px-3 py-2 md:col-span-2"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <select className="border rounded px-3 py-2" name="category" value={form.category} onChange={handleChange}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select className="border rounded px-3 py-2" name="supplier" value={form.supplier} onChange={handleChange}>
            <option value="">Select Supplier</option>
            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <input className="border rounded px-3 py-2" name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange}/>
          <input className="border rounded px-3 py-2" name="minStockLevel" type="number" placeholder="Min Stock Level" value={form.minStockLevel} onChange={handleChange}/>

          <div className="flex gap-3 mt-2 md:col-span-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>

            {editingId && (
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => { setEditingId(null); setForm(emptyForm); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Supplier</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-center p-3">Status</th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ backgroundColor: getRowColor(p) }} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3 max-w-xs truncate" title={p.description}>{p.description || '-'}</td>
                <td className="p-3">{p.sku}</td>
                <td className="p-3">{p.category?.name}</td>
                <td className="p-3">{p.supplier?.name}</td>
                <td className="p-3 text-right">{p.quantity}</td>
                <td className="p-3 text-center font-medium">{getStatus(p)}</td>
                <td className="p-3 text-center space-x-2">
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
