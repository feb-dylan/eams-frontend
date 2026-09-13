import { useEffect, useState } from "react";

const RequestForm = ({
  assets,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [assetId, setAssetId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!assetId) {
      setError("Please select an asset.");
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Reason is required.");
      return;
    }

    if (trimmedReason.length > 1000) {
      setError("Reason must not exceed 1000 characters.");
      return;
    }

    try {
      await onSubmit({
        assetId: Number(assetId),
        reason: trimmedReason,
      });
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to create request.";
      setError(
        typeof message === "string" ? message : "Failed to create request."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Select Asset</label>
        <select
          className="form-select"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          disabled={loading}
          required
        >
          <option value="">-- Choose an available asset --</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              [{asset.assetCode}] {asset.name}
              {asset.category?.name ? ` — ${asset.category.name}` : ""}
            </option>
          ))}
        </select>
        {assets.length === 0 && (
          <small className="text-muted">
            No available assets to request right now.
          </small>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Reason for Request</label>
        <textarea
          className="form-control"
          rows="4"
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          required
          placeholder="Explain why you need this asset..."
        />
        <small className="text-muted">{reason.length}/1000</small>
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || assets.length === 0}
        >
          {loading ? "Submitting..." : "Submit Request"}
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

export default RequestForm;