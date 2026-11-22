import { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import { getErrorMessage } from "../../utils/apiError";

const EMPTY = {
  assetCode: "",
  name: "",
  description: "",
  serialNumber: "",
  categoryId: "",
  purchaseDate: "",
  purchasePrice: "",
  warrantyExpiryDate: "",
  vendor: "",
  location: "",
};

function toForm(asset) {
  if (!asset) return EMPTY;
  return {
    assetCode: asset.assetCode || "",
    name: asset.name || "",
    description: asset.description || "",
    serialNumber: asset.serialNumber || "",
    categoryId: asset.category?.id ? String(asset.category.id) : "",
    purchaseDate: asset.purchaseDate || "",
    purchasePrice: asset.purchasePrice ?? "",
    warrantyExpiryDate: asset.warrantyExpiryDate || "",
    vendor: asset.vendor || "",
    location: asset.location || "",
  };
}

/**
 * Create / edit an asset.
 * The status is not editable here: it is set by the workflows
 * (assign, damage, maintenance). Retiring has its own action on the asset page.
 * Parent should pass key={asset?.id ?? "new"} so the form resets when switching assets.
 */
const AssetForm = ({ initialData, categories, onSubmit, onCancel, loading = false }) => {
  const [form, setForm] = useState(() => toForm(initialData));
  const [error, setError] = useState("");

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.assetCode.trim()) return setError("Asset code is required.");
    if (!form.name.trim()) return setError("Asset name is required.");
    if (!form.categoryId) return setError("Category is required.");
    if (form.purchasePrice !== "" && Number(form.purchasePrice) < 0) {
      return setError("Purchase price cannot be negative.");
    }
    if (form.purchaseDate && form.warrantyExpiryDate && form.warrantyExpiryDate < form.purchaseDate) {
      return setError("Warranty expiry cannot be before the purchase date.");
    }

    const blank = (v) => (v.trim() === "" ? null : v.trim());
    try {
      await onSubmit({
        assetCode: form.assetCode.trim(),
        name: form.name.trim(),
        description: blank(form.description),
        serialNumber: blank(form.serialNumber),
        categoryId: Number(form.categoryId),
        purchaseDate: form.purchaseDate || null,
        purchasePrice: form.purchasePrice === "" ? null : Number(form.purchasePrice),
        warrantyExpiryDate: form.warrantyExpiryDate || null,
        vendor: blank(form.vendor),
        location: blank(form.location),
        // unchanged status (the server rejects manual workflow statuses)
        status: initialData?.status || "AVAILABLE",
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save asset."));
    }
  };

  const field = (name, label, props = {}) => (
    <div className={props.col || "col-md-6"}>
      <label className="form-label" htmlFor={`asset-${name}`}>{label}</label>
      <input id={`asset-${name}`} name={name} className="form-control" value={form[name]}
             onChange={change} disabled={loading} {...props.input} />
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="row g-3">
        {field("assetCode", "Asset code *", { input: { maxLength: 50, placeholder: "LAP-0010" } })}
        {field("name", "Name *", { input: { maxLength: 150 } })}

        <div className="col-md-6">
          <label className="form-label" htmlFor="asset-categoryId">Category *</label>
          <select id="asset-categoryId" name="categoryId" className="form-select" value={form.categoryId}
                  onChange={change} disabled={loading}>
            <option value="">-- Select category --</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {field("serialNumber", "Serial number", { input: { maxLength: 100 } })}

        {field("purchaseDate", "Purchase date", { col: "col-md-4", input: { type: "date" } })}
        {field("purchasePrice", "Purchase price (USD)", {
          col: "col-md-4", input: { type: "number", min: 0, step: "0.01" },
        })}
        {field("warrantyExpiryDate", "Warranty until", { col: "col-md-4", input: { type: "date" } })}

        {field("vendor", "Vendor", { input: { maxLength: 150 } })}
        {field("location", "Location", { input: { maxLength: 255, placeholder: "HQ Floor 3 - IT" } })}

        <div className="col-12">
          <label className="form-label" htmlFor="asset-description">Description</label>
          <textarea id="asset-description" name="description" className="form-control" rows="3"
                    maxLength={1000} value={form.description} onChange={change} disabled={loading} />
        </div>

        {initialData && (
          <div className="col-12 small text-muted">
            Current status: <StatusBadge value={initialData.status} /> - status changes come from
            assignments, damage reports and maintenance.
          </div>
        )}
      </div>

      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Save changes" : "Create asset"}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
