import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import assetRequestApi from "../../services/assetRequestApi";
import { useAuth } from "../../context/AuthContext";

const PendingRequests = () => {
  const { userId } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await assetRequestApi.getPendingRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load pending requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId) => {
    if (!window.confirm("Approve this request?")) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await assetRequestApi.approveRequest(requestId, userId);

      setSuccess("Request approved successfully.");
      await loadRequests();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to approve request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingRequest) return;

    const trimmed = rejectionReason.trim();

    if (!trimmed) {
      setError("Rejection reason is required.");
      return;
    }

    if (trimmed.length > 500) {
      setError("Rejection reason must not exceed 500 characters.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await assetRequestApi.rejectRequest(
        rejectingRequest.id,
        userId,
        trimmed
      );

      setSuccess("Request rejected.");
      setRejectingRequest(null);
      setRejectionReason("");
      await loadRequests();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to reject request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Pending Requests</h2>
          <p className="text-muted mb-0">
            Approve or reject employee asset requests
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

      {/* Reject modal (inline) */}
      {rejectingRequest && (
        <div className="card shadow-sm mb-4 border-danger">
          <div className="card-header bg-danger text-white">
            <h5 className="mb-0">
              Reject Request #{rejectingRequest.id}
            </h5>
          </div>
          <div className="card-body">
            <label className="form-label">Rejection Reason</label>
            <textarea
              className="form-control mb-2"
              rows="3"
              maxLength={500}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={actionLoading}
            />
            <small className="text-muted">
              {rejectionReason.length}/500
            </small>

            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-danger"
                onClick={handleRejectSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectionReason("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Asset ID</th>
                <th>Reason</th>
                <th>Requested</th>
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
                    No pending requests.
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
                    <td>
                      {req.requestDate
                        ? new Date(req.requestDate).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/requests/${req.id}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          View
                        </Link>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApprove(req.id)}
                          disabled={actionLoading}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setRejectingRequest(req);
                            setRejectionReason("");
                          }}
                          disabled={actionLoading}
                        >
                          Reject
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

export default PendingRequests;