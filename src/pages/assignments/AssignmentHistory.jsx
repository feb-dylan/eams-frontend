import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import assignmentApi from "../../services/assignmentApi";

import { getErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/common/StatusBadge";

const AssignmentHistory = () => {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN"; // only admins receive returns; managers can view

  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [returningAssignment, setReturningAssignment] =
    useState(null);

  const [returnNote, setReturnNote] = useState("");

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await assignmentApi.getAssignmentHistory();

      setAssignments(data);
    } catch (err) {
      console.error(err);

      setError(
        getErrorMessage(err, "Failed to load assignment history.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleReturnSubmit = async () => {
    if (!returningAssignment) {
      return;
    }

    const trimmed = returnNote.trim();

    if (trimmed.length > 500) {
      setError(
        "Return note must not exceed 500 characters."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await assignmentApi.returnAssignment(
        returningAssignment.id,
        trimmed || null
      );

      setSuccess(
        "Asset returned successfully."
      );

      setReturningAssignment(null);
      setReturnNote("");

      await loadAssignments();
    } catch (err) {
      console.error(err);

      setError(
        getErrorMessage(err, "Failed to return asset.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mt-4">

      {/* PAGE HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2>
            Assignment History
          </h2>

          <p className="text-muted mb-0">
            All asset assignments and returns
          </p>

        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={loadAssignments}
          disabled={loading}
        >
          Refresh
        </button>

      </div>

      {/* ALERTS */}

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

      {/* RETURN FORM */}

      {returningAssignment && (

        <div className="card shadow-sm mb-4 border-success">

          <div className="card-header bg-success text-white">

            <h5 className="mb-0">
              Receive return: {returningAssignment.assetCode} from {returningAssignment.employeeName}
            </h5>

          </div>

          <div className="card-body">

            <p className="mb-3">

              Employee has requested to return this
              asset. Confirm after physically receiving
              the asset.

            </p>

            <label className="form-label">
              Return Note (optional)
            </label>

            <textarea
              className="form-control mb-2"
              rows="3"
              maxLength={500}
              value={returnNote}
              onChange={(e) =>
                setReturnNote(e.target.value)
              }
              disabled={actionLoading}
              placeholder="e.g. returned in good condition"
            />

            <small className="text-muted">
              {returnNote.length}/500
            </small>

            <div className="d-flex gap-2 mt-3">

              <button
                className="btn btn-success"
                onClick={handleReturnSubmit}
                disabled={actionLoading}
              >

                {actionLoading
                  ? "Receiving..."
                  : "Confirm Receive"}

              </button>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setReturningAssignment(null);
                  setReturnNote("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ASSIGNMENT TABLE */}

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Asset</th>
                <th>Employee</th>
                <th>Assigned</th>
                <th>Returned</th>
                <th>Status</th>
                <th>Assigned by</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
              ) : assignments.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4">No assignments yet.</td></tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link to={`/assets/${a.assetId}`}><strong>{a.assetCode}</strong></Link>
                      <div className="small text-muted">{a.assetName}</div>
                    </td>
                    <td>
                      {a.employeeName}
                      {a.employeeCode && <div className="small text-muted">{a.employeeCode}</div>}
                    </td>
                    <td>{formatDate(a.assignedDate)}</td>
                    <td>{a.returnedDate ? formatDate(a.returnedDate) : "-"}</td>
                    <td><StatusBadge value={a.status} /></td>
                    <td className="small">{a.assignedByEmail || "-"}</td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        {isAdmin && a.status === "RETURN_REQUESTED" && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => {
                              setReturningAssignment(a);
                              setReturnNote("");
                              setError("");
                              setSuccess("");
                            }}
                            disabled={actionLoading}
                          >
                            Receive return
                          </button>
                        )}
                        <Link to={`/admin/assignments/${a.id}`} className="btn btn-sm btn-outline-primary">
                          View details
                        </Link>
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

export default AssignmentHistory;