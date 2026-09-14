  import { useEffect, useState } from "react";
  import {
    Link,
    useNavigate,
    useParams,
  } from "react-router-dom";

  import maintenanceApi from "../../services/maintenanceApi";
  import { useAuth } from "../../context/AuthContext";

  const MaintenanceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { role } = useAuth();

    const [record, setRecord] = useState(null);

    const [status, setStatus] = useState("");
    const [endDate, setEndDate] = useState("");
    const [repairCost, setRepairCost] =
      useState("");
    const [technician, setTechnician] =
      useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] =
      useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const canUpdate =
      role === "ADMIN" ||
      role === "TECHNICIAN";

    const loadMaintenance = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await maintenanceApi.getMaintenanceById(
            id
          );

        setRecord(data);

        setStatus(data.status || "");
        setEndDate(data.endDate || "");
        setRepairCost(
          data.repairCost ?? ""
        );
        setTechnician(
          data.technician || ""
        );
        setNotes(data.notes || "");
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            error.response?.data ||
            "Failed to load maintenance record."
        );
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadMaintenance();
    }, [id]);

    const handleUpdate = async (e) => {
      e.preventDefault();

      if (
        repairCost !== "" &&
        Number(repairCost) < 0
      ) {
        setError(
          "Repair cost cannot be negative."
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
        notes.length > 1000
      ) {
        setError(
          "Notes must not exceed 1000 characters."
        );
        return;
      }

      if (
        endDate &&
        record.startDate &&
        endDate < record.startDate
      ) {
        setError(
          "End date cannot be before start date."
        );
        return;
      }

      try {
        setUpdateLoading(true);
        setError("");
        setSuccess("");

        const updated =
          await maintenanceApi.updateMaintenance(
            id,
            {
              status: status || null,
              endDate: endDate || null,
              repairCost:
                repairCost === ""
                  ? null
                  : Number(repairCost),
              technician:
                technician.trim() || null,
              notes: notes.trim() || null,
            }
          );

        setRecord(updated);

        setStatus(updated.status || "");
        setEndDate(updated.endDate || "");
        setRepairCost(
          updated.repairCost ?? ""
        );
        setTechnician(
          updated.technician || ""
        );
        setNotes(updated.notes || "");

        setSuccess(
          "Maintenance record updated successfully."
        );
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            error.response?.data ||
            "Failed to update maintenance record."
        );
      } finally {
        setUpdateLoading(false);
      }
    };

    const getStatusBadge = (status) => {
      switch (status) {
        case "SCHEDULED":
          return "bg-warning text-dark";

        case "IN_PROGRESS":
          return "bg-primary";

        case "COMPLETED":
          return "bg-success";

        default:
          return "bg-secondary";
      }
    };

    if (loading) {
      return (
        <div className="container mt-4">
          <div className="text-center py-5">
            Loading maintenance record...
          </div>
        </div>
      );
    }

    if (error && !record) {
      return (
        <div className="container mt-4">
          <div className="alert alert-danger">
            {error}
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <div className="container mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>
              Maintenance #{record.id}
            </h2>

            <p className="text-muted mb-0">
              Maintenance and repair details
            </p>
          </div>

          <Link
            to="/maintenance"
            className="btn btn-outline-secondary"
          >
            Back
          </Link>
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

        <div className="row g-4">
          {/* Information */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  Maintenance Information
                </h5>
              </div>

              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-sm-4 fw-bold">
                    Maintenance ID
                  </div>

                  <div className="col-sm-8">
                    {record.id}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-sm-4 fw-bold">
                    Asset
                  </div>

                  <div className="col-sm-8">
                    <strong>
                      {record.assetCode}
                    </strong>

                    <br />

                    {record.assetName}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-sm-4 fw-bold">
                    Technician
                  </div>

                  <div className="col-sm-8">
                    {record.technician || "-"}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-sm-4 fw-bold">
                    Start Date
                  </div>

                  <div className="col-sm-8">
                    {record.startDate || "-"}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-sm-4 fw-bold">
                    End Date
                  </div>

                  <div className="col-sm-8">
                    {record.endDate || "-"}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-sm-4 fw-bold">
                    Repair Cost
                  </div>

                  <div className="col-sm-8">
                    {record.repairCost !==
                    null
                      ? Number(
                          record.repairCost
                        ).toFixed(2)
                      : "-"}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-sm-4 fw-bold">
                    Status
                  </div>

                  <div className="col-sm-8">
                    <span
                      className={`badge ${getStatusBadge(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-sm-4 fw-bold">
                    Description
                  </div>

                  <div className="col-sm-8">
                    <div className="border rounded p-3 bg-light">
                      {record.description}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-4 fw-bold">
                    Notes
                  </div>

                  <div className="col-sm-8">
                    {record.notes || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Update */}
          <div className="col-lg-5">
            {canUpdate ? (
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">
                    Update Maintenance
                  </h5>
                </div>

                <div className="card-body">
                  <form onSubmit={handleUpdate}>
                    {/* Status */}
                    <div className="mb-3">
                      <label className="form-label">
                        Status
                      </label>

                      <select
                        className="form-select"
                        value={status}
                        onChange={(e) =>
                          setStatus(
                            e.target.value
                          )
                        }
                        disabled={updateLoading}
                      >
                        <option value="SCHEDULED">
                          SCHEDULED
                        </option>

                        <option value="IN_PROGRESS">
                          IN_PROGRESS
                        </option>

                        <option value="COMPLETED">
                          COMPLETED
                        </option>
                      </select>
                    </div>

                    {/* Technician */}
                    <div className="mb-3">
                      <label className="form-label">
                        Technician
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        maxLength="100"
                        value={technician}
                        onChange={(e) =>
                          setTechnician(
                            e.target.value
                          )
                        }
                        disabled={updateLoading}
                      />
                    </div>

                    {/* End Date */}
                    <div className="mb-3">
                      <label className="form-label">
                        End Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) =>
                          setEndDate(
                            e.target.value
                          )
                        }
                        disabled={updateLoading}
                      />
                    </div>

                    {/* Repair Cost */}
                    <div className="mb-3">
                      <label className="form-label">
                        Repair Cost
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="0.01"
                        value={repairCost}
                        onChange={(e) =>
                          setRepairCost(
                            e.target.value
                          )
                        }
                        disabled={updateLoading}
                      />
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <label className="form-label">
                        Notes
                      </label>

                      <textarea
                        className="form-control"
                        rows="5"
                        maxLength="1000"
                        value={notes}
                        onChange={(e) =>
                          setNotes(
                            e.target.value
                          )
                        }
                        disabled={updateLoading}
                      />

                      <div className="form-text">
                        {notes.length}/1000
                        characters
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        "Update Maintenance"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card shadow-sm">
                <div className="card-body">
                  <p className="mb-0">
                    Maintenance records can be
                    managed by administrators and
                    technicians.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default MaintenanceDetails;