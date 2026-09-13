import { useEffect, useState } from "react";

const AssetForm = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    assetCode: "",
    name: "",
    description: "",
    serialNumber: "",
    categoryId: "",
    purchaseDate: "",
    purchasePrice: "",
    status: "AVAILABLE",
    location: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        assetCode: initialData.assetCode || "",
        name: initialData.name || "",
        description: initialData.description || "",
        serialNumber: initialData.serialNumber || "",
        categoryId: initialData.category?.id
          ? String(initialData.category.id)
          : "",
        purchaseDate: initialData.purchaseDate || "",
        purchasePrice:
          initialData.purchasePrice !== null &&
          initialData.purchasePrice !== undefined
            ? String(initialData.purchasePrice)
            : "",
        status: initialData.status || "AVAILABLE",
        location: initialData.location || "",
      });
    } else {
      setFormData({
        assetCode: "",
        name: "",
        description: "",
        serialNumber: "",
        categoryId: "",
        purchaseDate: "",
        purchasePrice: "",
        status: "AVAILABLE",
        location: "",
      });
    }

    setError("");
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const assetCode = formData.assetCode.trim();
    const name = formData.name.trim();
    const description = formData.description.trim();
    const serialNumber = formData.serialNumber.trim();
    const location = formData.location.trim();

    if (!assetCode) {
      setError("Asset code is required.");
      return;
    }

    if (!name) {
      setError("Asset name is required.");
      return;
    }

    if (!formData.categoryId) {
      setError("Category is required.");
      return;
    }

    if (
      formData.purchasePrice !== "" &&
      Number(formData.purchasePrice) < 0
    ) {
      setError("Purchase price cannot be negative.");
      return;
    }

    const data = {
      assetCode,
      name,
      description: description || null,
      serialNumber: serialNumber || null,
      categoryId: Number(formData.categoryId),
      purchaseDate:
        formData.purchaseDate || null,
      purchasePrice:
        formData.purchasePrice === ""
          ? null
          : Number(formData.purchasePrice),
      status: formData.status || "AVAILABLE",
      location: location || null,
    };

    try {
      await onSubmit(data);
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to save asset.";

      setError(
        typeof message === "string"
          ? message
          : "Failed to save asset."
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

      <div className="row">
        {/* Asset Code */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Asset Code
          </label>

          <input
            type="text"
            name="assetCode"
            className="form-control"
            value={formData.assetCode}
            onChange={handleChange}
            maxLength={50}
            required
            disabled={loading}
            placeholder="e.g. LAP-001"
          />
        </div>

        {/* Asset Name */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Asset Name
          </label>

          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            maxLength={150}
            required
            disabled={loading}
            placeholder="e.g. Dell Latitude 5440"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">
          Description
        </label>

        <textarea
          name="description"
          className="form-control"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          maxLength={1000}
          disabled={loading}
          placeholder="Enter asset description"
        />
      </div>

      <div className="row">
        {/* Serial Number */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Serial Number
          </label>

          <input
            type="text"
            name="serialNumber"
            className="form-control"
            value={formData.serialNumber}
            onChange={handleChange}
            maxLength={100}
            disabled={loading}
            placeholder="Enter serial number"
          />
        </div>

        {/* Category */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Category
          </label>

          <select
            name="categoryId"
            className="form-select"
            value={formData.categoryId}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        {/* Purchase Date */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Purchase Date
          </label>

          <input
            type="date"
            name="purchaseDate"
            className="form-control"
            value={formData.purchaseDate}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Purchase Price */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Purchase Price
          </label>

          <input
            type="number"
            name="purchasePrice"
            className="form-control"
            value={formData.purchasePrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            disabled={loading}
            placeholder="0.00"
          />
        </div>

        {/* Status */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Status
          </label>

          <select
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="AVAILABLE">
              AVAILABLE
            </option>
            <option value="ASSIGNED">
              ASSIGNED
            </option>
            <option value="DAMAGED">
              DAMAGED
            </option>
            <option value="MAINTENANCE">
              MAINTENANCE
            </option>
            <option value="RETIRED">
              RETIRED
            </option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="mb-3">
        <label className="form-label">
          Location
        </label>

        <input
          type="text"
          name="location"
          className="form-control"
          value={formData.location}
          onChange={handleChange}
          maxLength={255}
          disabled={loading}
          placeholder="e.g. IT Department"
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
              ? "Update Asset"
              : "Create Asset"}
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

export default AssetForm;