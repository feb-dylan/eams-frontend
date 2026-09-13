import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import assignmentApi from "../../services/assignmentApi";

import { useAuth } from "../../context/AuthContext";

const AssignmentHistory = () => {
  const { userId } = useAuth();

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
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load assignment history."
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
        userId,
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
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to return asset."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-primary";

      case "RETURN_REQUESTED":
        return "bg-warning text-dark";

      case "RETURNED":
        return "bg-success";

      default:
        return "bg-secondary";
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
              Receive Return #
              {returningAssignment.id}
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

                <th>ID</th>
                <th>Asset ID</th>
                <th>Employee ID</th>
                <th>Assigned Date</th>
                <th>Returned Date</th>
                <th>Status</th>
                <th>Assigned By</th>
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
                    Loading...
                  </td>

                </tr>

              ) : assignments.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-4"
                  >
                    No assignments yet.
                  </td>

                </tr>

              ) : (

                assignments.map((a) => (

                  <tr key={a.id}>

                    <td>
                      {a.id}
                    </td>

                    <td>
                      {a.assetId}
                    </td>

                    <td>
                      {a.employeeId}
                    </td>

                    <td>
                      {a.assignedDate ?? "-"}
                    </td>

                    <td>
                      {a.returnedDate ?? "-"}
                    </td>

                    <td>

                      <span
                        className={`badge ${getStatusBadge(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>

                    </td>

                    <td>
                      {a.assignedBy ?? "-"}
                    </td>

                    <td>

                      {a.status ===
                        "RETURN_REQUESTED" ? (

                        <div className="d-flex gap-2">

                          <Link
                            to={`/admin/assignments/${a.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View Details
                          </Link>

                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => {
                              setReturningAssignment(a);
                              setReturnNote("");
                              setError("");
                              setSuccess("");
                            }}
                            disabled={actionLoading}
                          >
                            Receive Return
                          </button>

                        </div>

                      ) : a.status === "RETURNED" ? (

                        <Link
                          to={`/admin/assignments/${a.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Details
                        </Link>

                      ) : (

                        <span className="text-muted">
                          Employee has not requested return
                        </span>

                      )}

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