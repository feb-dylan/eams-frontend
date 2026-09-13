import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import categoryApi from "../../services/categoryApi";
import CategoryForm from "../../components/categories/CategoryForm";
import { useAuth } from "../../context/AuthContext";

const CategoryList = () => {
  const { role } = useAuth();

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const isAdmin = role === "ADMIN";

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await categoryApi.getCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
    setSuccess("");
    setError("");
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (categoryData) => {
    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      if (editingCategory) {
        await categoryApi.updateCategory(
          editingCategory.id,
          categoryData
        );

        setSuccess("Category updated successfully.");
      } else {
        await categoryApi.createCategory(categoryData);

        setSuccess("Category created successfully.");
      }

      setShowForm(false);
      setEditingCategory(null);

      await loadCategories();
    } catch (error) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await categoryApi.deleteCategory(id);

      setSuccess("Category deleted successfully.");

      await loadCategories();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to delete category."
      );
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          Loading categories...
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Categories</h2>
          <p className="text-muted mb-0">
            Manage asset categories
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={handleCreate}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {showForm && isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              {editingCategory
                ? "Edit Category"
                : "Create Category"}
            </h5>
          </div>

          <div className="card-body">
            <CategoryForm
              initialData={editingCategory}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCategory(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="alert alert-info">
          No categories found.
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>

                    <td>
                      <strong>{category.name}</strong>
                    </td>

                    <td>
                      {category.description || (
                        <span className="text-muted">
                          No description
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/categories/${category.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </Link>

                        {isAdmin && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() =>
                                handleEdit(category)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(category.id)
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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

export default CategoryList;