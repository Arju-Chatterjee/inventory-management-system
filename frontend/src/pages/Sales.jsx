import React, { useEffect, useState } from "react";
import { productService } from "../services/productService";
import { saleService } from "../services/saleService";

export const Sales = () => {
  const [products, setProducts] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // --- FILTER & DROPDOWN STATE ---
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState({ 
    name: "", 
    location: "", 
    phone: "",
    fromDate: "",
    toDate: "" 
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);

  const [editingSale, setEditingSale] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  /* ================= LOAD ================= */

  const loadProducts = async () => {
    const res = await productService.getAll();
    const data = res?.data?.data || res?.data || res || [];
    setProducts(data);
  };

  const loadSales = async () => {
    const res = await saleService.getHistory();
    setSalesHistory(res || []);
  };

  /* ================= ADD ITEM (Fixed for Edit Modal) ================= */

  const addItem = () => {
    // 1. Find the product object from the master list
    const product = products.find(p => String(p._id) === String(selectedProduct));
    
    if (!product) {
      alert("Please select a valid product");
      return;
    }

    if (qty <= 0) {
        alert("Quantity must be at least 1");
        return;
    }

    setCart(prev => {
      // 2. Check if item already exists in the cart (using String comparison for safety)
      const exist = prev.find(i => String(i.product) === String(product._id));

      if (exist) {
        // If it exists, update the quantity
        return prev.map(i =>
          String(i.product) === String(product._id)
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }

      // 3. If it's a new item, add it to the list
      return [
        ...prev,
        {
          product: product._id,
          productName: product.name,
          quantity: qty
        }
      ];
    });

    // Reset inputs
    setSelectedProduct("");
    setQty(1);
  };

  const removeItem = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  /* ================= CREATE/UPDATE/EDIT LOGIC ================= */

  const createSale = async () => {
    if (!cart.length) return alert("Add items first");
    await saleService.create({ customerName, customerLocation, customerPhone, items: cart });
    closeModal();
    loadSales();
  };

  const openEdit = (sale) => {
    const normalizedCart = sale.items.map(item => {
      // Ensure we find the product name even if backend only sent IDs
      const prodId = item.product?._id || item.product;
      const productData = products.find(p => String(p._id) === String(prodId));

      return {
        product: prodId,
        productName: item.product?.name || productData?.name || "Unknown Product",
        quantity: item.quantity
      };
    });

    setEditingSale(sale);
    setCart(normalizedCart);
    setCustomerName(sale.customerName || "");
    setCustomerLocation(sale.customerLocation || "");
    setCustomerPhone(sale.customerPhone || "");
    setShowEdit(true);
  };

  const updateSale = async () => {
    if (!cart.length) return alert("Cart cannot be empty");
    await saleService.update(editingSale._id, {
      customerName,
      customerLocation,
      customerPhone,
      items: cart
    });
    closeModal();
    loadSales();
  };

  const closeModal = () => {
    setShowCreate(false);
    setShowEdit(false);
    setCart([]);
    setEditingSale(null);
    setCustomerName("");
    setCustomerLocation("");
    setCustomerPhone("");
    setSelectedProduct("");
    setQty(1);
  };

  /* ================= FILTER LOGIC ================= */

  const filteredData = salesHistory.filter(sale => {
    const nameMatch = sale.customerName?.toLowerCase().includes(filter.name.toLowerCase());
    const locMatch = sale.customerLocation?.toLowerCase().includes(filter.location.toLowerCase());
    const phoneMatch = sale.customerPhone?.includes(filter.phone);

    const saleDate = new Date(sale.createdAt);
    let dateMatch = true;

    if (filter.fromDate) {
      const start = new Date(filter.fromDate);
      start.setHours(0, 0, 0, 0);
      dateMatch = dateMatch && saleDate >= start;
    }
    if (filter.toDate) {
      const end = new Date(filter.toDate);
      end.setHours(23, 59, 59, 999);
      dateMatch = dateMatch && saleDate <= end;
    }

    return nameMatch && locMatch && phoneMatch && dateMatch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Stock Dispatch</h1>

      {/* FILTER BAR */}
      <div className="bg-gray-50 p-4 rounded-xl border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input className="border p-2 rounded-lg text-sm" placeholder="Search Name..." value={filter.name} onChange={(e) => setFilter({...filter, name: e.target.value})} />
          <input className="border p-2 rounded-lg text-sm" placeholder="Search Location..." value={filter.location} onChange={(e) => setFilter({...filter, location: e.target.value})} />
          <input className="border p-2 rounded-lg text-sm" placeholder="Search Contact..." value={filter.phone} onChange={(e) => setFilter({...filter, phone: e.target.value})} />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <label>From:</label>
            <input type="date" className="border p-1 rounded-lg" value={filter.fromDate} onChange={(e) => setFilter({...filter, fromDate: e.target.value})} />
          </div>
          <div className="flex items-center gap-2">
            <label>To:</label>
            <input type="date" className="border p-1 rounded-lg" value={filter.toDate} onChange={(e) => setFilter({...filter, toDate: e.target.value})} />
          </div>
          <button className="text-red-500 text-xs ml-auto" onClick={() => setFilter({ name: "", location: "", phone: "", fromDate: "", toDate: "" })}>Reset</button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm sm:text-base">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">S.No</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(sale => (
                <React.Fragment key={sale._id}>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3">{sale.serialNumber}</td>
                    <td className="p-3">{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">{sale.customerName}</td>
                    <td className="p-3">{sale.customerLocation}</td>
                    <td className="p-3">{sale.customerPhone}</td>
                    <td className="p-3 text-center flex justify-center gap-2">
                      <button className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold" onClick={() => setExpandedId(expandedId === sale._id ? null : sale._id)}>
                        {expandedId === sale._id ? "Hide" : "Items"}
                      </button>
                      <button className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg" onClick={() => openEdit(sale)}>Edit</button>
                    </td>
                  </tr>
                  {expandedId === sale._id && (
                    <tr className="bg-blue-50/30">
                      <td colSpan="6" className="p-4 border-b">
                        <div className="bg-white p-4 rounded-xl border shadow-sm max-w-sm ml-10">
                          <h4 className="font-bold text-blue-900 mb-2 text-sm uppercase">Dispatch List</h4>
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                              <span>{item.product?.name || "Product"}</span>
                              <span className="font-bold text-blue-600">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={() => setShowCreate(true)} className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full text-3xl shadow-xl">+</button>

      {/* MODAL */}
      {(showCreate || showEdit) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{showCreate ? "New Dispatch" : "Edit Dispatch"}</h2>
            
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <input className="border rounded-lg p-2.5" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <input className="border rounded-lg p-2.5" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              <input className="border rounded-lg p-2.5 sm:col-span-2" placeholder="Location" value={customerLocation} onChange={e => setCustomerLocation(e.target.value)} />
            </div>

            {/* PRODUCT ADD SECTION (The part you needed fixed) */}
            <div className="flex gap-2 mb-4">
              <select className="border rounded-lg p-2.5 flex-1" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                <option value="">Select product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} className="border rounded-lg p-2.5 w-24 text-center" />
              <button onClick={addItem} className="bg-blue-600 text-white px-5 rounded-lg font-bold">Add</button>
            </div>

            <div className="border rounded-xl max-h-64 overflow-y-auto divide-y">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 gap-3">
                  <div className="flex-1 text-gray-700 font-medium">{item.productName}</div>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v > 0) setCart(prev => prev.map((i, n) => n === idx ? { ...i, quantity: v } : i));
                    }} 
                    className="border rounded w-20 px-2 py-1 text-center" 
                  />
                  <button className="text-red-500 text-sm" onClick={() => removeItem(idx)}>Remove</button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button onClick={closeModal} className="border px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={showCreate ? createSale : updateSale} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};