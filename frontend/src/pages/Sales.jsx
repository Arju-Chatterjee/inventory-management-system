import React, { useEffect, useState } from "react";
import { productService } from "../services/productService";
import { saleService } from "../services/saleService";

export const Sales = () => {
  const [products, setProducts] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [expandedSale, setExpandedSale] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productService.getAll();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      setProducts(list);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };

  const loadSales = async () => {
    try {
      const data = await saleService.getHistory();
      setSalesHistory(data || []);
    } catch (err) {
      console.error("Sales load error:", err);
    }
  };

  const addToCart = () => {
    const product = products.find((p) => p._id === selectedProduct);
    if (!product) return;

    const qty = Number(quantity);
    if (qty <= 0) return alert("Invalid quantity");

    const existing = cart.find((i) => i.product === product._id);
    if (existing) {
      existing.quantity += qty;
      existing.subtotal = existing.quantity * existing.unitPrice;
      setCart([...cart]);
    } else {
      setCart([
        ...cart,
        {
          product: product._id,
          productName: product.name,
          quantity: qty,
          unitPrice: product.price,
          subtotal: qty * product.price,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const removeItem = (index) => setCart(cart.filter((_, i) => i !== index));

  const total = cart.reduce((s, i) => s + i.subtotal, 0);

  const completeSale = async () => {
    if (!cart.length) return alert("Cart empty");

    try {
      await saleService.create({
        customerName,
        customerLocation,
        customerPhone,
        items: cart,
      });

      setCart([]);
      setCustomerName("");
      setCustomerLocation("");
      setCustomerPhone("");
      setShowForm(false);

      loadProducts();
      loadSales();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Sales Register</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">S.No</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-center p-3"></th>
            </tr>
          </thead>
          <tbody>
            {salesHistory.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">No sales found</td>
              </tr>
            )}

            {salesHistory.map((sale) => (
              <React.Fragment key={sale._id}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3">{sale.serialNumber || "-"}</td>
                  <td className="p-3">{sale.customerName}</td>
                  <td className="p-3">{sale.customerLocation || sale.customerAddress || "-"}</td>
                  <td className="p-3">{sale.customerPhone}</td>
                  <td className="p-3 text-center">
                    <button className="text-blue-600 font-bold" onClick={() => setExpandedSale(expandedSale === sale._id ? null : sale._id)}>
                      {expandedSale === sale._id ? "▼" : "▶"}
                    </button>
                  </td>
                </tr>

                {expandedSale === sale._id && (
                  <tr className="bg-gray-50">
                    <td colSpan="5" className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Product</th>
                            <th className="text-right p-2">Qty</th>
                            <th className="text-right p-2">Price</th>
                            <th className="text-right p-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sale.items.map((item, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-2">{item.productName}</td>
                              <td className="p-2 text-right">{item.quantity}</td>
                              <td className="p-2 text-right">₹{item.unitPrice}</td>
                              <td className="p-2 text-right">₹{item.subtotal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="text-right font-semibold mt-3">
                        Subtotal: ₹{sale.items.reduce((s, i) => s + i.subtotal, 0)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed right-6 bottom-6 w-[380px] bg-white p-6 rounded-2xl shadow-2xl border">
          <h2 className="text-xl font-semibold mb-4">New Sale</h2>

          <div className="space-y-3">
            <input className="border rounded px-3 py-2 w-full" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Location" value={customerLocation} onChange={(e) => setCustomerLocation(e.target.value)} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />

            <select className="border rounded px-3 py-2 w-full" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>

            <input type="number" min="1" className="border rounded px-3 py-2 w-full" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />

            <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 w-full" onClick={addToCart}>Add Item</button>

            <div className="max-h-40 overflow-y-auto border rounded">
              {cart.map((i, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border-b text-sm">
                  <span>{i.productName} x{i.quantity}</span>
                  <span className="font-medium">₹{i.subtotal}</span>
                  <button className="text-red-600" onClick={() => removeItem(idx)}>✕</button>
                </div>
              ))}
            </div>

            <div className="font-bold text-lg text-right">Total: ₹{total}</div>

            <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700 w-full" onClick={completeSale}>Save Sale</button>
          </div>
        </div>
      )}

      <button onClick={() => setShowForm(true)} className="fixed right-6 bottom-6 w-16 h-16 rounded-full bg-blue-600 text-white text-3xl shadow-lg hover:bg-blue-700">+</button>
    </div>
  );
};
