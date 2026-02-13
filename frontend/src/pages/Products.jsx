import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts({ search });
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button>Add Product</Button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          className="px-4 py-2 border rounded-md w-full md:w-96"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">SKU</th>
              <th className="text-left p-4">Category</th>
              <th className="text-right p-4">Price</th>
              <th className="text-right p-4">Quantity</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t hover:bg-gray-50">
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.sku}</td>
                <td className="p-4">{product.category?.name}</td>
                <td className="p-4 text-right">${product.price.toFixed(2)}</td>
                <td className="p-4 text-right">{product.quantity}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      product.isLowStock
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {product.isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td className="p-4">
                  <Button variant="secondary" className="text-sm mr-2">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
