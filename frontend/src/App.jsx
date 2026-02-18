import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from "./components/common/Navbar";
import { LoadingSpinner } from './components/common/LoadingSpinner';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Sales } from './pages/Sales';
import { Categories } from './pages/Categories';
import { Suppliers } from './pages/Suppliers';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';



/* =========================
   Protected Layout Route
   ========================= */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <Outlet />
      </div>
    </>
  );
};



/* =========================
   Admin Only Route
   ========================= */
const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};



/* =========================
   App Component
   ========================= */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* PUBLIC ROUTE */}
          <Route path="/login" element={<Login />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/reports" element={<Reports />} />

            {/* ADMIN ONLY */}
            <Route element={<AdminRoute />}>
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>

          {/* DEFAULT REDIRECTS */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
