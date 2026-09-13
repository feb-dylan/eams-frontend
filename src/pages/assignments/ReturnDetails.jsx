import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import assignmentApi from "../../services/assignmentApi";

const ReturnDetails = () => {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await assignmentApi.getAssignmentById(
          assignmentId
        );

      setAssignment(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load return details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

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

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3">
            Loading return details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error}
        </div>

        <Link
          to="/assignments"
          className="btn btn-secondary"
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back to Assignment History
        </Link>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Assignment not found.
        </div>

        <Link
          to="/assignments"
          className="btn btn-secondary"
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back to Assignment History
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Return Details
          </h2>

          <p className="text-muted mb-0">
            Assignment #{assignment.id}
          </p>
        </div>

        {/* ONE BACK BUTTON */}

        <Link
          to="/assignments"
          className="btn btn-outline-secondary"
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back to Assignment History
        </Link>

      </div>

      {/* STATUS */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center">

            <div>
              <h5 className="mb-1">
                Assignment Status
              </h5>

              <p className="text-muted mb-0">
                Current status of this asset assignment
              </p>
            </div>

            <span
              className={`badge fs-6 ${getStatusBadge(
                assignment.status
              )}`}
            >
              {assignment.status}
            </span>

          </div>

        </div>

      </div>

      {/* ASSIGNMENT INFORMATION */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-header bg-white">

          <h5 className="mb-0">
            <i className="bi bi-clipboard-check me-2 text-primary"></i>
            Assignment Information
          </h5>

        </div>

        <div className="card-body">

          <div className="row g-4">

            <div className="col-md-6">

              <label className="text-muted small">
                Assignment ID
              </label>

              <div className="fw-semibold">
                #{assignment.id}
              </div>

            </div>

            <div className="col-md-6">

              <label className="text-muted small">
                Asset ID
              </label>

              <div className="fw-semibold">
                #{assignment.assetId}
              </div>

            </div>

            <div className="col-md-6">

              <label className="text-muted small">
                Employee ID
              </label>

              <div className="fw-semibold">
                #{assignment.employeeId}
              </div>

            </div>

            <div className="col-md-6">

              <label className="text-muted small">
                Assigned By
              </label>

              <div className="fw-semibold">
                {assignment.assignedBy
                  ? `Admin #${assignment.assignedBy}`
                  : "-"}
              </div>

            </div>

            <div className="col-md-6">

              <label className="text-muted small">
                Assigned Date
              </label>

              <div className="fw-semibold">
                {assignment.assignedDate || "-"}
              </div>

            </div>

            <div className="col-md-6">

              <label className="text-muted small">
                Returned Date
              </label>

              <div className="fw-semibold">
                {assignment.returnedDate || "-"}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* RETURN INFORMATION */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-header bg-white">

          <h5 className="mb-0">
            <i className="bi bi-arrow-return-left me-2 text-success"></i>
            Return Information
          </h5>

        </div>

        <div className="card-body">

          <div className="mb-4">

            <label className="text-muted small">
              Return Status
            </label>

            <div className="mt-1">

              <span
                className={`badge ${getStatusBadge(
                  assignment.status
                )}`}
              >
                {assignment.status}
              </span>

            </div>

          </div>

          <div>

            <label className="text-muted small">
              Return Note
            </label>

            {assignment.returnNote ? (

              <div className="alert alert-light border mt-2 mb-0">

                <i className="bi bi-chat-left-text me-2"></i>

                {assignment.returnNote}

              </div>

            ) : (

              <p className="text-muted mt-2 mb-0">
                No return note was provided.
              </p>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ReturnDetails;