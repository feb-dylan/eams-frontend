import { useEffect, useState } from "react";

const DamageForm = ({
  assets,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [assetId, setAssetId] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    setAssetId("");
    setDescription("");
    setEvidenceUrl("");
    setError("");
  }, [assets]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!assetId) {
      setError("Please select an asset.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the damage.");
      return;
    }

    if (description.length > 2000) {
      setError(
        "Description must not exceed 2000 characters."
      );
      return;
    }

    if (evidenceUrl.length > 500) {
      setError(
        "Evidence URL must not exceed 500 characters."
      );
      return;
    }

    try {
      await onSubmit({
        assetId: Number(assetId),
        description: description.trim(),
        evidenceUrl: evidenceUrl.trim() || null,
      });
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to submit damage report."
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

      {/* Asset */}
      <div className="mb-3">
        <label className="form-label">
          Asset <span className="text-danger">*</span>
        </label>

        <select
          className="form-select"
          value={assetId}
          onChange={(e) =>
            setAssetId(e.target.value)
          }
          disabled={loading}
        >
          <option value="">
            Select Asset
          </option>

          {assets.map((asset) => (
            <option
              key={asset.id}
              value={asset.id}
            >
              {asset.assetCode} - {asset.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">
          Damage Description{" "}
          <span className="text-danger">*</span>
        </label>

        <textarea
          className="form-control"
          rows="5"
          maxLength="2000"
          placeholder="Describe the damage..."
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          disabled={loading}
        />

        <div className="form-text">
          {description.length}/2000 characters
        </div>
      </div>

      {/* Evidence URL */}
      <div className="mb-3">
        <label className="form-label">
          Evidence URL
        </label>

        <input
          type="url"
          className="form-control"
          maxLength="500"
          placeholder="https://example.com/damage-photo"
          value={evidenceUrl}
          onChange={(e) =>
            setEvidenceUrl(e.target.value)
          }
          disabled={loading}
        />

        <div className="form-text">
          Optional link to a damage photo or other
          evidence.
        </div>
      </div>

      {/* Buttons */}
      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Submitting...
            </>
          ) : (
            "Submit Damage Report"
          )}
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DamageForm;