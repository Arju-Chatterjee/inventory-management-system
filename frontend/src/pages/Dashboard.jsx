import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await reportService.getDashboard();
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalProducts || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Inventory Value</h3>
          <p className="text-3xl font-bold text-green-600">
            ${(stats?.totalInventoryValue || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-600">{stats?.lowStockCount || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Sales Today</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.salesToday || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            ${(stats?.salesTodayAmount || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Sales This Week</h3>
          <p className="text-2xl font-bold">{stats?.salesThisWeek || 0} transactions</p>
          <p className="text-gray-600">${(stats?.salesThisWeekAmount || 0).toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Sales This Month</h3>
          <p className="text-2xl font-bold">{stats?.salesThisMonth || 0} transactions</p>
          <p className="text-gray-600">${(stats?.salesThisMonthAmount || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Low Stock Alert</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">SKU</th>
                  <th className="text-right p-2">Current Stock</th>
                  <th className="text-right p-2">Min Level</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.sku}</td>
                    <td className="p-2 text-right text-red-600">{product.quantity}</td>
                    <td className="p-2 text-right">{product.minStockLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link
            to="/products?lowStock=true"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            View All Low Stock Products →
          </Link>
        </div>
      )}

      {/* Top Selling Products */}
      {stats?.topSellingProducts && stats.topSellingProducts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products (Last 30 Days)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">SKU</th>
                  <th className="text-right p-2">Units Sold</th>
                  <th className="text-right p-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSellingProducts.map((item) => (
                  <tr key={item.product._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.product.name}</td>
                    <td className="p-2">{item.product.sku}</td>
                    <td className="p-2 text-right">{item.totalQuantitySold}</td>
                    <td className="p-2 text-right">${item.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
