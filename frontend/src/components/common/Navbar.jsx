import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(null);

  // Detect scroll for glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menu = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Products", path: "/products" },
    { title: "Sales", path: "/sales" },
    { title: "Categories", path: "/categories" },
    { title: "Suppliers", path: "/suppliers" },
    ...(user?.role === "admin" ? [{ title: "Users", path: "/users" }] : []),
    { title: "Reports", path: "/reports" }
  ];

  return (
    <>
      {/* HEADER */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200"
            : "bg-white shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <motion.img
                src={Logo}
                alt="Company Logo"
                className="h-10 w-auto object-contain"
                whileHover={{ scale: 1.06 }}
              />

              <div className="leading-tight">
                <div className="font-bold text-green-700 tracking-wide flex items-center gap-1">
                  HR IGNITE
                  <motion.span
                    className="text-yellow-500"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  >
                    ☀️
                  </motion.span>
                </div>
                <div className="text-xs text-orange-500 font-semibold">
                  Inventory System
                </div>
              </div>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden lg:flex items-center gap-1">
              {menu.map((item) => (
                <div
                  key={item.title}
                  onMouseEnter={() => setHovered(item.title)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative"
                >
                  <NavLink
                    to={item.path}
                    className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors"
                  >
                    {item.title}
                  </NavLink>

                  {hovered === item.title && (
                    <motion.div
                      layoutId="navHover"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                    />
                  )}
                </div>
              ))}

              <div className="h-6 w-px bg-gray-300 mx-2" />

              {/* USER BADGE */}
              <div className="flex items-center gap-3 bg-green-50 px-3 py-1.5 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                  {user?.firstName?.[0]}
                </div>
                <span className="text-sm text-gray-700">
                  {user?.firstName} ({user?.role})
                </span>
              </div>

              {/* LOGOUT */}
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-lg"
              >
                Logout
              </motion.button>
            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden w-9 h-9 rounded-lg bg-green-50 text-green-700"
            >
              ☰
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden bg-white border-t shadow-xl"
            >
              <div className="px-4 py-3 space-y-2">
                {menu.map((item) => (
                  <Link
                    key={item.title}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-green-50"
                  >
                    {item.title}
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="w-full mt-2 bg-red-600 text-white py-2 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer so content not hidden under fixed navbar */}
      <div className="h-16" />
    </>
  );
}
