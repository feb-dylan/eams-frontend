import { useEffect, useState } from "react";

const CategoryForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }

    setError("");
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Category name must not exceed 100 characters.");
      return;
    }

    if (trimmedDescription.length > 500) {
      setError("Description must not exceed 500 characters.");
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription || null,
      });
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to save category.";

      setError(
        typeof message === "string"
          ? message
          : "Failed to save category."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">
          Category Name
        </label>

        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          disabled={loading}
          placeholder="Enter category name"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          Description
        </label>

        <textarea
          className="form-control"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          disabled={loading}
          placeholder="Enter category description"
        />
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Category"
              : "Create Category"}
        </button>

        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default CategoryForm;