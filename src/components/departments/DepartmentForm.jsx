import { useEffect, useState } from "react";

const DepartmentForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? "",
        description:
          initialData.description ?? "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      name: formData.name.trim(),
      description:
        formData.description.trim() === ""
          ? null
          : formData.description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">
          Department Name
        </label>

        <input
          type="text"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          maxLength={100}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          Description
        </label>

        <textarea
          name="description"
          className="form-control"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          maxLength={500}
        ></textarea>

        <small className="text-muted">
          Maximum 500 characters.
        </small>
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
            ? "Update Department"
            : "Create Department"}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DepartmentForm;