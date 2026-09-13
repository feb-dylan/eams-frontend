import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import assetRequestApi from "../../services/assetRequestApi";
import { useAuth } from "../../context/AuthContext";

const ApprovedRequests = () => {
  const { userId } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await assetRequestApi.getApprovedRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load approved requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAssign = async (requestId) => {
    if (!window.confirm("Assign this asset to the employee?")) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await assetRequestApi.assignAsset(requestId, userId);

      setSuccess("Asset assigned successfully.");
      await loadRequests();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to assign asset."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Approved Requests</h2>
          <p className="text-muted mb-0">
            Assign the requested asset to the employee
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={loadRequests}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Asset ID</th>
                <th>Reason</th>
                <th>Approved By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No approved requests awaiting assignment.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{req.employeeId}</td>
                    <td>{req.assetId ?? "-"}</td>
                    <td className="text-truncate" style={{ maxWidth: 260 }}>
                      {req.reason}
                    </td>
                    <td>{req.approvedBy ?? "-"}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/requests/${req.id}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          View
                        </Link>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleAssign(req.id)}
                          disabled={actionLoading}
                        >
                          Assign Asset
                        </button>
                      </div>
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

export default ApprovedRequests;