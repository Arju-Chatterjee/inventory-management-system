import { useEffect, useState } from "react";
import { saleService } from "../services/saleService";

export const Reports = () => {

  const [sales, setSales] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const data = await saleService.getHistory();
    setSales(data || []);
  };

  /* FILTER LOGIC */
  const filteredSales = sales.filter(sale => {

    const date = new Date(sale.createdAt);

    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate + "T23:59:59")) return false;

    return true;
  });

  const totalItems = filteredSales.reduce(
    (sum, sale) => sum + sale.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Dispatch Reports
      </h1>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col sm:flex-row gap-3">

        <input
          type="date"
          className="border rounded-lg px-3 py-2"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="border rounded-lg px-3 py-2"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
        />

        <button
          onClick={() => { setFromDate(""); setToDate(""); }}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          Clear
        </button>
      </div>

      {/* SUMMARY */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-lg font-semibold">
          Total Dispatch Records: {filteredSales.length}
        </p>
        <p className="text-lg font-semibold">
          Total Items Dispatched: {totalItems}
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[800px] w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">S.No</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Items</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale._id} className="border-b">
                <td className="p-3">{sale.serialNumber}</td>
                <td className="p-3">{new Date(sale.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{sale.customerName}</td>
                <td className="p-3">{sale.customerLocation}</td>
                <td className="p-3">{sale.customerPhone}</td>
                <td className="p-3">
                  {sale.items.map((i,idx)=>(
                    <div key={idx}>
                      {i.productName} x {i.quantity}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
