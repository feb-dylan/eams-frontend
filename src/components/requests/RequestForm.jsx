import { useState } from "react";
import { getErrorMessage } from "../../utils/apiError";

/**
 * New asset request: either a specific available asset, or "any item of a category"
 * (the admin then picks the unit when assigning).
 */
const RequestForm = ({ assets, categories = [], onSubmit, onCancel, loading = false }) => {
  const [mode, setMode] = useState("asset");
  const [assetId, setAssetId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [neededBy, setNeededBy] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "asset" && !assetId) return setError("Please select an asset.");
    if (mode === "category" && !categoryId) return setError("Please select a category.");
    const trimmedReason = reason.trim();
    if (!trimmedReason) return setError("Reason is required.");

    try {
      await onSubmit({
        assetId: mode === "asset" ? Number(assetId) : undefined,
        categoryId: mode === "category" ? Number(categoryId) : undefined,
        reason: trimmedReason,
        priority,
        neededBy: neededBy || undefined,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create request."));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="btn-group mb-3" role="group" aria-label="Request type">
        <input type="radio" className="btn-check" id="mode-asset" checked={mode === "asset"}
               onChange={() => setMode("asset")} />
        <label className="btn btn-outline-primary" htmlFor="mode-asset">A specific asset</label>
        <input type="radio" className="btn-check" id="mode-category" checked={mode === "category"}
               onChange={() => setMode("category")} />
        <label className="btn btn-outline-primary" htmlFor="mode-category">Any item of a category</label>
      </div>

      {mode === "asset" ? (
        <div className="mb-3">
          <label className="form-label" htmlFor="request-asset">Asset</label>
          <select id="request-asset" className="form-select" value={assetId}
                  onChange={(e) => setAssetId(e.target.value)} disabled={loading}>
            <option value="">-- Choose an available asset --</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                [{asset.assetCode}] {asset.name}
                {asset.category?.name ? ` - ${asset.category.name}` : ""}
              </option>
            ))}
          </select>
          {assets.length === 0 && (
            <div className="form-text">No available assets right now - try a category request.</div>
          )}
        </div>
      ) : (
        <div className="mb-3">
          <label className="form-label" htmlFor="request-category">Category</label>
          <select id="request-category" className="form-select" value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)} disabled={loading}>
            <option value="">-- Choose a category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="form-text">An administrator will choose a suitable item for you.</div>
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="request-priority">Priority</label>
          <select id="request-priority" className="form-select" value={priority}
                  onChange={(e) => setPriority(e.target.value)} disabled={loading}>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="request-needed-by">Needed by (optional)</label>
          <input id="request-needed-by" type="date" className="form-control" min={today}
                 value={neededBy} onChange={(e) => setNeededBy(e.target.value)} disabled={loading} />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="request-reason">Reason</label>
        <textarea id="request-reason" className="form-control" rows="4" maxLength={1000}
                  value={reason} onChange={(e) => setReason(e.target.value)} disabled={loading}
                  placeholder="Explain why you need this asset..." />
        <div className="form-text">{reason.length}/1000</div>
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default RequestForm;
