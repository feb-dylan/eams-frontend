import { useEffect, useState } from "react";
import { getErrorMessage } from "../../utils/apiError";

const CategoryForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lifespan, setLifespan] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setLifespan(initialData.expectedLifespanMonths ?? "");
    } else {
      setName("");
      setDescription("");
      setLifespan("");
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

    if (trimmedDescription.length > 255) {
      setError("Description must not exceed 255 characters.");
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription || null,
        expectedLifespanMonths: lifespan === "" ? null : Number(lifespan),
      });
    } catch (error) {
      console.error(error);

      const message =
        getErrorMessage(error, "Failed to save category.");

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
          maxLength={255}
          disabled={loading}
          placeholder="Enter category description"
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="category-lifespan">
          Expected lifespan (months)
        </label>
        <input
          id="category-lifespan"
          type="number"
          min="1"
          max="600"
          className="form-control"
          value={lifespan}
          onChange={(e) => setLifespan(e.target.value)}
          disabled={loading}
          placeholder="e.g. 48 for laptops"
        />
        <div className="form-text">
          Used for the asset health score and depreciation. Empty = 48 months.
        </div>
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