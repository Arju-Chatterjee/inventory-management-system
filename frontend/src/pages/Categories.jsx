import { useEffect, useState } from "react";
import { categoryService } from "../services/categoryService";

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadCategories = async () => {
    const res = await categoryService.getAll();
    setCategories(res.data.data || res.data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      await categoryService.update(editingId, { name });
      setEditingId(null);
    } else {
      await categoryService.create({ name });
    }

    setName("");
    loadCategories();
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditingId(cat._id);
  };

  // ✅ FIXED DELETE FUNCTION
  const handleDelete = async (cat) => {
    if (cat.productCount > 0) {
      alert("Category contains products. Move or delete them first.");
      return;
    }

    if (!window.confirm("Delete category?")) return;

    try {
      await categoryService.remove(cat._id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8 max-w-xl">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Category" : "Add Category"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            className="border rounded px-3 py-2 flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />

          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              type="submit"
            >
              {editingId ? "Update" : "Add"}
            </button>

            {editingId && (
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto max-w-xl">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Products</th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{cat.name}</td>
                <td className="p-3">{cat.productCount}</td>

                <td className="p-3 text-center space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    onClick={() => handleEdit(cat)}
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => handleDelete(cat)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
