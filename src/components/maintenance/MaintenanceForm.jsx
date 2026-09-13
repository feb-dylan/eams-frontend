import { useEffect, useState } from "react";

const MaintenanceForm = ({
  assets,
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [assetId, setAssetId] = useState("");
  const [technician, setTechnician] =
    useState("");
  const [description, setDescription] =
    useState("");
  const [startDate, setStartDate] =
    useState("");
  const [endDate, setEndDate] =
    useState("");
  const [repairCost, setRepairCost] =
    useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setAssetId(initialData.assetId || "");
      setTechnician(
        initialData.technician || ""
      );
      setDescription(
        initialData.description || ""
      );
      setStartDate(
        initialData.startDate || ""
      );
      setEndDate(initialData.endDate || "");
      setRepairCost(
        initialData.repairCost ?? ""
      );
      setNotes(initialData.notes || "");
    } else {
      setAssetId("");
      setTechnician("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setRepairCost("");
      setNotes("");
    }

    setError("");
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!assetId) {
      setError("Please select an asset.");
      return;
    }

    if (!description.trim()) {
      setError(
        "Maintenance description is required."
      );
      return;
    }

    if (!startDate) {
      setError("Start date is required.");
      return;
    }

    if (description.length > 2000) {
      setError(
        "Description must not exceed 2000 characters."
      );
      return;
    }

    if (technician.length > 100) {
      setError(
        "Technician must not exceed 100 characters."
      );
      return;
    }

    if (
      endDate &&
      startDate &&
      endDate < startDate
    ) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    if (
      repairCost !== "" &&
      Number(repairCost) < 0
    ) {
      setError(
        "Repair cost cannot be negative."
      );
      return;
    }

    try {
      await onSubmit({
        assetId: Number(assetId),
        technician:
          technician.trim() || null,
        description: description.trim(),
        startDate,
        endDate: endDate || null,
        repairCost:
          repairCost === ""
            ? null
            : Number(repairCost),
        notes: notes.trim() || null,
      });
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to save maintenance record."
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

      <div className="row g-3">
        {/* Asset */}
        <div className="col-md-6">
          <label className="form-label">
            Asset{" "}
            <span className="text-danger">*</span>
          </label>

          <select
            className="form-select"
            value={assetId}
            onChange={(e) =>
              setAssetId(e.target.value)
            }
            disabled={
              loading || Boolean(initialData)
            }
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

        {/* Technician */}
        <div className="col-md-6">
          <label className="form-label">
            Technician
          </label>

          <input
            type="text"
            className="form-control"
            maxLength="100"
            placeholder="Technician name"
            value={technician}
            onChange={(e) =>
              setTechnician(e.target.value)
            }
            disabled={loading}
          />
        </div>

        {/* Start Date */}
        <div className="col-md-6">
          <label className="form-label">
            Start Date{" "}
            <span className="text-danger">*</span>
          </label>

          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            disabled={loading}
          />
        </div>

        {/* End Date */}
        <div className="col-md-6">
          <label className="form-label">
            End Date
          </label>

          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            disabled={loading}
          />
        </div>

        {/* Repair Cost */}
        <div className="col-md-6">
          <label className="form-label">
            Repair Cost
          </label>

          <input
            type="number"
            className="form-control"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={repairCost}
            onChange={(e) =>
              setRepairCost(e.target.value)
            }
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="col-12">
          <label className="form-label">
            Description{" "}
            <span className="text-danger">*</span>
          </label>

          <textarea
            className="form-control"
            rows="5"
            maxLength="2000"
            placeholder="Describe the maintenance work..."
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

        {/* Notes */}
        <div className="col-12">
          <label className="form-label">
            Notes
          </label>

          <textarea
            className="form-control"
            rows="4"
            maxLength="1000"
            placeholder="Additional notes..."
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            disabled={loading}
          />
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Saving...
            </>
          ) : initialData ? (
            "Update Maintenance"
          ) : (
            "Create Maintenance"
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

export default MaintenanceForm;