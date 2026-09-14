import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import maintenanceApi from "../../services/maintenanceApi";
import MaintenanceForm from "../../components/maintenance/MaintenanceForm.jsx";
import { useAuth } from "../../context/AuthContext";

const MaintenanceList = () => {
  const { role } = useAuth();

  const [maintenance, setMaintenance] = useState([]);
  const [assets, setAssets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const [error, setError] = useState("");
  const [assetError, setAssetError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("ALL");

  const isAdminOrTechnician =
    role === "ADMIN" || role === "TECHNICIAN";

  // =========================================================
  // LOAD MAINTENANCE
  // =========================================================

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await maintenanceApi.getAllMaintenance();

      setMaintenance(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load maintenance:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to load maintenance records."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ASSETS AVAILABLE FOR MAINTENANCE
  // =========================================================

  const loadAssets = async () => {
    try {
      setAssetsLoading(true);
      setAssetError("");

      const data =
        await maintenanceApi.getRepairingAssets();

      setAssets(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load repairing assets:",
        err
      );

      setAssets([]);

      setAssetError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to load assets available for maintenance."
      );
    } finally {
      setAssetsLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadMaintenance();
  }, []);

  // =========================================================
  // LOAD ELIGIBLE ASSETS WHEN FORM OPENS
  // =========================================================

  useEffect(() => {
    if (showForm) {
      loadAssets();
    }
  }, [showForm]);

  // =========================================================
  // CREATE MAINTENANCE
  // =========================================================

  const handleCreateMaintenance = async (formData) => {
    try {
      setFormLoading(true);
      setError("");

      await maintenanceApi.createMaintenance(
        formData
      );

      setShowForm(false);

      await loadMaintenance();
      await loadAssets();
    } catch (err) {
      console.error(
        "Failed to create maintenance:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to create maintenance."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredMaintenance =
    maintenance.filter((item) => {
      if (statusFilter === "ALL") {
        return true;
      }

      return item.status === statusFilter;
    });

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "badge bg-primary";

      case "IN_PROGRESS":
        return "badge bg-warning text-dark";

      case "COMPLETED":
        return "badge bg-success";

      default:
        return "badge bg-secondary";
    }
  };

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="mt-2 mb-0">
              Loading maintenance records...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="container-fluid py-4">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Maintenance Management
          </h2>

          <p className="text-muted mb-0">
            Manage asset maintenance and repair records
          </p>
        </div>

        {isAdminOrTechnician && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setError("");
              setAssetError("");
              setShowForm(true);
            }}
          >
            <i className="bi bi-tools me-2"></i>
            Add Maintenance
          </button>
        )}
      </div>

      {/* Error */}

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Create Maintenance Form */}

      {showForm && isAdminOrTechnician && (
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Create Maintenance
            </h5>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowForm(false)}
              disabled={formLoading}
            >
              <i className="bi bi-x-lg me-1"></i>
              Close
            </button>
          </div>

          <div className="card-body">
            {/* Asset Loading */}

            {assetsLoading && (
              <div className="text-center py-4">
                <div
                  className="spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">
                    Loading...
                  </span>
                </div>

                <p className="mt-2 mb-0">
                  Loading assets available for maintenance...
                </p>
              </div>
            )}

            {/* Asset Error / Empty */}

            {!assetsLoading &&
              assets.length === 0 && (
                <div className="alert alert-warning mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>

                  {assetError
                    ? assetError
                    : "There are currently no assets with a REPAIRING damage report available for maintenance."}
                </div>
              )}

            {/* Maintenance Form */}

            {!assetsLoading &&
              assets.length > 0 && (
                <MaintenanceForm
                  assets={assets}
                  onSubmit={handleCreateMaintenance}
                  onCancel={() =>
                    setShowForm(false)
                  }
                  loading={formLoading}
                />
              )}
          </div>
        </div>
      )}

      {/* Maintenance Table Card */}

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Maintenance Records
          </h5>

          <span className="badge bg-secondary">
            {filteredMaintenance.length} records
          </span>
        </div>

        {/* Filter */}

        <div className="card-body border-bottom">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label
                htmlFor="statusFilter"
                className="form-label mb-1"
              >
                Filter by Status
              </label>

              <select
                id="statusFilter"
                className="form-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="SCHEDULED">
                  Scheduled
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="COMPLETED">
                  Completed
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}

        <div className="card-body p-0">
          {filteredMaintenance.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-tools fs-1"></i>

              <h5 className="mt-3">
                No maintenance records
              </h5>

              <p className="mb-0">
                There are no maintenance records
                matching the selected filter.
              </p>
            </div>
          ) : (
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
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMaintenance.map(
                    (item) => (
                      <tr key={item.id}>
                        {/* ID */}

                        <td>
                          <strong>
                            #{item.id}
                          </strong>
                        </td>

                        {/* Asset */}

                        <td>
                          <div>
                            <strong>
                              {item.assetCode || "-"}
                            </strong>

                            <div className="text-muted small">
                              {item.assetName || "-"}
                            </div>
                          </div>
                        </td>

                        {/* Technician */}

                        <td>
                          {item.technician || "-"}
                        </td>

                        {/* Start Date */}

                        <td>
                          {formatDate(
                            item.startDate
                          )}
                        </td>

                        {/* End Date */}

                        <td>
                          {formatDate(
                            item.endDate
                          )}
                        </td>

                        {/* Repair Cost */}

                        <td>
                          {formatMoney(
                            item.repairCost
                          )}
                        </td>

                        {/* Status */}

                        <td>
                          <span
                            className={getStatusBadge(
                              item.status
                            )}
                          >
                            {formatStatus(
                              item.status
                            )}
                          </span>
                        </td>

                        {/* Action */}

                        <td>
                          <Link
                            to={`/maintenance/${item.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceList;