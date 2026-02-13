import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold">
              Inventory System
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
                Dashboard
              </Link>
              <Link to="/products" className="hover:bg-blue-700 px-3 py-2 rounded">
                Products
              </Link>
              <Link to="/sales" className="hover:bg-blue-700 px-3 py-2 rounded">
                Sales
              </Link>
              <Link to="/categories" className="hover:bg-blue-700 px-3 py-2 rounded">
                Categories
              </Link>
              <Link to="/suppliers" className="hover:bg-blue-700 px-3 py-2 rounded">
                Suppliers
              </Link>
              {user?.role === 'admin' && (
                <Link to="/users" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Users
                </Link>
              )}
              <Link to="/reports" className="hover:bg-blue-700 px-3 py-2 rounded">
                Reports
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {user?.firstName} {user?.lastName} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
