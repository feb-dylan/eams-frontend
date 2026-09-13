import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import assetRequestApi from "../../services/assetRequestApi";
import assetApi from "../../services/assetApi";
import RequestForm from "../../components/requests/RequestForm";
import { useAuth } from "../../context/AuthContext";

const MyRequests = () => {
  const { employeeId, role } = useAuth();

  const [requests, setRequests] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const isEmployee = role === "EMPLOYEE";

  const loadRequests = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      setError("");
      const data = await assetRequestApi.getMyRequests(employeeId);
      setRequests(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load your requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableAssets = async () => {
    try {
      setLoadingAssets(true);
      const data = await assetApi.getAssetsByStatus("AVAILABLE");
      setAvailableAssets(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load available assets."
      );
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleOpenForm = async () => {
    setSuccess("");
    setError("");
    setShowForm(true);
    if (availableAssets.length === 0) {
      await loadAvailableAssets();
    }
  };

  const handleCreate = async (data) => {
    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      await assetRequestApi.createRequest({
        employeeId: employeeId,   // ← FIXED: employees.id, not users.id
        assetId: data.assetId,
        reason: data.reason,
      });

      setSuccess("Request submitted successfully.");
      setShowForm(false);

      await loadRequests();
      await loadAvailableAssets();
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-warning text-dark";
      case "APPROVED":
        return "bg-success";
      case "REJECTED":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Asset Requests</h2>
          <p className="text-muted mb-0">Track the status of your requests</p>
        </div>

        {isEmployee && (
          <button
            className="btn btn-primary"
            onClick={handleOpenForm}
            disabled={showForm || loadingAssets}
          >
            <i className="bi bi-plus-lg me-1"></i>
            New Request
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && isEmployee && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">New Asset Request</h5>
          </div>
          <div className="card-body">
            {loadingAssets ? (
              <div>Loading available assets...</div>
            ) : (
              <RequestForm
                assets={availableAssets}
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                loading={formLoading}
              />
            )}
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Asset ID</th>
                <th>Reason</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{req.assetId ?? "-"}</td>
                    <td className="text-truncate" style={{ maxWidth: 300 }}>
                      {req.reason}
                    </td>
                    <td>
                      {req.requestDate
                        ? new Date(req.requestDate).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/requests/${req.id}`}
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

export default MyRequests;