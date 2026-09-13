import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import maintenanceApi from "../../services/maintenanceApi";
import assetApi from "../../services/assetApi";
import MaintenanceForm from "../../components/maintenance/MaintenanceForm";

import { useAuth } from "../../context/AuthContext";

const MaintenanceList = () => {
  const { role } = useAuth();

  const [maintenanceRecords, setMaintenanceRecords] =
    useState([]);

  const [assets, setAssets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await maintenanceApi.getAllMaintenance();

      setMaintenanceRecords(data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load maintenance records."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const data =
        await assetApi.getAssets();

      const usableAssets = data.filter(
        (asset) => asset.status !== "RETIRED"
      );

      setAssets(usableAssets);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load assets."
      );
    }
  };

  useEffect(() => {
    loadMaintenance();
    loadAssets();
  }, []);

  const handleCreate = () => {
    setShowForm(true);
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (maintenanceData) => {
    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      await maintenanceApi.createMaintenance(
        maintenanceData
      );

      setSuccess(
        "Maintenance record created successfully."
      );

      setShowForm(false);

      await loadMaintenance();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to create maintenance record."
      );

      throw error;
    } finally {
      setFormLoading(false);
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

      case "CANCELLED":
        return "bg-secondary";

      default:
        return "bg-secondary";
    }
  };

  const filteredRecords = selectedStatus
    ? maintenanceRecords.filter(
        (record) =>
          record.status === selectedStatus
      )
    : maintenanceRecords;

  const formatCost = (cost) => {
    if (
      cost === null ||
      cost === undefined
    ) {
      return "-";
    }

    return Number(cost).toFixed(2);
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Maintenance</h2>

          <p className="text-muted mb-0">
            Manage asset maintenance and repair
            activities.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={loadMaintenance}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>

          {(role === "ADMIN" ||
            role === "TECHNICIAN") && (
            <button
              className="btn btn-primary"
              onClick={handleCreate}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Add Maintenance
            </button>
          )}
        </div>
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

      {/* Create Form */}
      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              Create Maintenance Record
            </h5>
          </div>

          <div className="card-body">
            {assets.length === 0 ? (
              <div className="alert alert-warning">
                No usable assets are available.
              </div>
            ) : (
              <MaintenanceForm
                assets={assets}
                onSubmit={handleSubmit}
                onCancel={() =>
                  setShowForm(false)
                }
                loading={formLoading}
              />
            )}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">
                Status
              </label>

              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All Statuses
                </option>

                <option value="SCHEDULED">
                  SCHEDULED
                </option>

                <option value="IN_PROGRESS">
                  IN_PROGRESS
                </option>

                <option value="COMPLETED">
                  COMPLETED
                </option>

                <option value="CANCELLED">
                  CANCELLED
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>Technician</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Repair Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-4"
                  >
                    Loading maintenance records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-4"
                  >
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>

                    <td>
                      <strong>
                        {record.assetCode}
                      </strong>

                      <br />

                      <small className="text-muted">
                        {record.assetName}
                      </small>
                    </td>

                    <td>
                      {record.technician || "-"}
                    </td>

                    <td>
                      {record.startDate || "-"}
                    </td>

                    <td>
                      {record.endDate || "-"}
                    </td>

                    <td>
                      {formatCost(
                        record.repairCost
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${getStatusBadge(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/maintenance/${record.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceList;