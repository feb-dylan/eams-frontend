import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import assetRequestApi from "../../services/assetRequestApi";
import assetApi from "../../services/assetApi";
import employeeApi from "../../services/employeeApi";
import { useAuth } from "../../context/AuthContext";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, userId } = useAuth();

  const [request, setRequest] = useState(null);
  const [asset, setAsset] = useState(null);
  const [employee, setEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";

  // =========================================================
  // LOAD REQUEST DETAILS
  // =========================================================

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const requestData =
        await assetRequestApi.getRequestById(id);

      setRequest(requestData);

      // Load asset information
      if (requestData.assetId) {
        try {
          const assetData =
            await assetApi.getAssetById(requestData.assetId);

          setAsset(assetData);
        } catch (err) {
          console.error("Failed to load asset:", err);
        }
      }

      // Load employee information
      if (requestData.employeeId) {
        try {
          const employeeData =
            await employeeApi.getEmployeeById(
              requestData.employeeId
            );

          setEmployee(employeeData);
        } catch (err) {
          console.error(
            "Failed to load employee:",
            err
          );
        }
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load request details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id]);

  // =========================================================
  // MANAGER APPROVE
  // =========================================================

  const handleApprove = async () => {
    if (
      !window.confirm(
        "Approve this asset request?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await assetRequestApi.approveRequest(
        request.id,
        userId
      );

      setSuccess(
        "Asset request approved successfully."
      );

      await loadRequest();
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

  // =========================================================
  // MANAGER REJECT
  // =========================================================

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError(
        "Please provide a rejection reason."
      );
      return;
    }

    if (
      !window.confirm(
        "Reject this asset request?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await assetRequestApi.rejectRequest(
        request.id,
        userId,
        {
          rejectionReason:
            rejectionReason.trim(),
        }
      );

      setSuccess(
        "Asset request rejected successfully."
      );

      setShowRejectForm(false);
      setRejectionReason("");

      await loadRequest();
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

  // =========================================================
  // ADMIN ASSIGN
  // =========================================================

  const handleAssign = async () => {
    if (
      !window.confirm(
        "Assign this asset to the employee?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await assetRequestApi.assignAsset(
        request.id,
        userId
      );

      setSuccess(
        "Asset assigned successfully."
      );

      await loadRequest();
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

  // =========================================================
  // REQUEST STATUS BADGE
  // =========================================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-warning text-dark";

      case "APPROVED":
        return "bg-success";

      case "ASSIGNED":
        return "bg-primary";

      case "REJECTED":
        return "bg-danger";

      default:
        return "bg-secondary";
    }
  };

  // =========================================================
  // ASSIGNMENT STATUS BADGE
  // =========================================================

  const getAssignmentStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-success";

      case "RETURN_REQUESTED":
        return "bg-warning text-dark";

      case "RETURNED":
        return "bg-secondary";

      default:
        return "bg-secondary";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

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
            Loading request details...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // REQUEST NOT FOUND
  // =========================================================

  if (!request) {
    return (
      <div className="container mt-4">

        <div className="alert alert-danger">
          Request not found.
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back
        </button>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="container mt-4">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <div className="d-flex align-items-center gap-2 mb-1">

            <h2 className="fw-bold mb-0">
              Request Details
            </h2>

            <span
              className={`badge ${getStatusBadge(
                request.status
              )}`}
            >
              {request.status}
            </span>

          </div>

          <p className="text-muted mb-0">
            Asset Request #{request.id}
          </p>

        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back
        </button>

      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </div>
      )}

      <div className="row g-4">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="col-lg-8">

          {/* =================================================
              REQUEST INFORMATION
          ================================================= */}

          <div className="card shadow-sm border-0 mb-4">

            <div className="card-header bg-white">

              <h5 className="mb-0">
                <i className="bi bi-file-text me-2 text-primary"></i>
                Request Information
              </h5>

            </div>

            <div className="card-body">

              {/* Request ID */}

              <div className="row mb-3">

                <div className="col-md-4 fw-semibold">
                  Request ID
                </div>

                <div className="col-md-8">
                  #{request.id}
                </div>

              </div>

              {/* Employee */}

              <div className="row mb-3">

                <div className="col-md-4 fw-semibold">
                  Employee
                </div>

                <div className="col-md-8">

                  {employee ? (

                    <Link
                      to={`/employees/${request.employeeId}`}
                      className="text-decoration-none fw-semibold"
                    >
                      {employee.name ||
                        employee.fullName ||
                        `Employee #${request.employeeId}`}
                    </Link>

                  ) : (

                    `Employee #${request.employeeId}`

                  )}

                </div>

              </div>

              {/* Asset */}

              <div className="row mb-3">

                <div className="col-md-4 fw-semibold">
                  Asset
                </div>

                <div className="col-md-8">

                  {request.assetId ? (

                    <Link
                      to={`/assets/${request.assetId}`}
                      className="text-decoration-none fw-semibold"
                    >
                      {asset?.name ||
                        `Asset #${request.assetId}`}
                    </Link>

                  ) : (

                    "-"

                  )}

                </div>

              </div>

              {/* Request Status */}

              <div className="row mb-3">

                <div className="col-md-4 fw-semibold">
                  Request Status
                </div>

                <div className="col-md-8">

                  <span
                    className={`badge ${getStatusBadge(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>

                </div>

              </div>

              {/* Assignment Status */}

              {request.assignmentStatus && (

                <div className="row mb-3">

                  <div className="col-md-4 fw-semibold">
                    Assignment Status
                  </div>

                  <div className="col-md-8">

                    <span
                      className={`badge ${getAssignmentStatusBadge(
                        request.assignmentStatus
                      )}`}
                    >
                      {request.assignmentStatus}
                    </span>

                  </div>

                </div>

              )}

              {/* Reason */}

              <div className="row mb-3">

                <div className="col-md-4 fw-semibold">
                  Reason
                </div>

                <div className="col-md-8">

                  <div className="bg-light rounded p-3">
                    {request.reason || "-"}
                  </div>

                </div>

              </div>

              {/* Requested At */}

              <div className="row mb-3">

                <div className="col-md-4 fw-semibold">
                  Requested At
                </div>

                <div className="col-md-8">
                  {request.requestDate || "-"}
                </div>

              </div>

              {/* Approved By */}

              {request.approvedBy && (

                <div className="row mb-3">

                  <div className="col-md-4 fw-semibold">
                    Approved By
                  </div>

                  <div className="col-md-8">
                    User #{request.approvedBy}
                  </div>

                </div>

              )}

              {/* Approved At */}

              {request.approvedAt && (

                <div className="row mb-3">

                  <div className="col-md-4 fw-semibold">
                    Approved At
                  </div>

                  <div className="col-md-8">
                    {request.approvedAt}
                  </div>

                </div>

              )}

              {/* Rejection Reason */}

              {request.rejectionReason && (

                <div className="row mb-0">

                  <div className="col-md-4 fw-semibold">
                    Rejection Reason
                  </div>

                  <div className="col-md-8">

                    <div className="alert alert-danger mb-0">
                      {request.rejectionReason}
                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              ASSIGNMENT STATUS INFORMATION
          ================================================= */}

          {request.assignmentStatus === "RETURN_REQUESTED" && (

            <div className="alert alert-warning">

              <div className="d-flex align-items-start">

                <i className="bi bi-arrow-return-left fs-4 me-3"></i>

                <div>

                  <h6 className="fw-bold mb-1">
                    Asset Return Requested
                  </h6>

                  <p className="mb-0">
                    The employee has requested to return
                    this asset. The asset is waiting for
                    the admin to receive the physical return.
                  </p>

                </div>

              </div>

            </div>

          )}

          {request.assignmentStatus === "RETURNED" && (

            <div className="alert alert-secondary">

              <div className="d-flex align-items-start">

                <i className="bi bi-arrow-return-left fs-4 me-3"></i>

                <div>

                  <h6 className="fw-bold mb-1">
                    Asset Returned
                  </h6>

                  <p className="mb-0">
                    This asset was previously assigned
                    to the employee and has now been
                    returned.
                  </p>

                </div>

              </div>

            </div>

          )}

          {request.assignmentStatus === "ACTIVE" && (

            <div className="alert alert-success">

              <div className="d-flex align-items-start">

                <i className="bi bi-check-circle fs-4 me-3"></i>

                <div>

                  <h6 className="fw-bold mb-1">
                    Asset Currently Assigned
                  </h6>

                  <p className="mb-0">
                    This asset is currently assigned
                    to the employee.
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="col-lg-4">

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="card shadow-sm border-0">

            <div className="card-header bg-white">

              <h5 className="mb-0">

                <i className="bi bi-lightning me-2 text-primary"></i>

                Actions

              </h5>

            </div>

            <div className="card-body">

              {/* =================================================
                  MANAGER ACTIONS
              ================================================= */}

              {isManager &&
                request.status === "PENDING" && (

                  <div>

                    <button
                      className="btn btn-success w-100 mb-2"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >

                      {actionLoading ? (

                        <>

                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>

                          Processing...

                        </>

                      ) : (

                        <>

                          <i className="bi bi-check-lg me-1"></i>

                          Approve Request

                        </>

                      )}

                    </button>

                    {!showRejectForm ? (

                      <button
                        className="btn btn-danger w-100"
                        onClick={() =>
                          setShowRejectForm(true)
                        }
                        disabled={actionLoading}
                      >

                        <i className="bi bi-x-lg me-1"></i>

                        Reject Request

                      </button>

                    ) : (

                      <div>

                        <label className="form-label fw-semibold">
                          Rejection Reason
                        </label>

                        <textarea
                          className="form-control mb-2"
                          rows="4"
                          value={rejectionReason}
                          onChange={(e) =>
                            setRejectionReason(
                              e.target.value
                            )
                          }
                          placeholder="Enter rejection reason..."
                          disabled={actionLoading}
                        />

                        <button
                          className="btn btn-danger w-100 mb-2"
                          onClick={handleReject}
                          disabled={actionLoading}
                        >

                          {actionLoading ? (

                            <>

                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>

                              Rejecting...

                            </>

                          ) : (

                            <>

                              <i className="bi bi-x-lg me-1"></i>

                              Confirm Rejection

                            </>

                          )}

                        </button>

                        <button
                          className="btn btn-outline-secondary w-100"
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectionReason("");
                            setError("");
                          }}
                          disabled={actionLoading}
                        >
                          Cancel
                        </button>

                      </div>

                    )}

                  </div>

                )}

              {/* =================================================
                  ADMIN ASSIGN
              ================================================= */}

              {isAdmin &&
                request.status === "APPROVED" && (

                  <button
                    className="btn btn-primary w-100"
                    onClick={handleAssign}
                    disabled={actionLoading}
                  >

                    {actionLoading ? (

                      <>

                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>

                        Assigning...

                      </>

                    ) : (

                      <>

                        <i className="bi bi-box-arrow-right me-1"></i>

                        Assign Asset

                      </>

                    )}

                  </button>

                )}

              {/* =================================================
                  MANAGER PROCESSED MESSAGE
              ================================================= */}

              {isManager &&
                request.status !== "PENDING" && (

                  <div className="text-muted">

                    <i className="bi bi-info-circle me-2"></i>

                    No actions available for this request
                    (already processed).

                  </div>

                )}

              {/* =================================================
                  ADMIN PENDING MESSAGE
              ================================================= */}

              {isAdmin &&
                request.status === "PENDING" && (

                  <div className="text-muted">

                    <i className="bi bi-hourglass-split me-2"></i>

                    Awaiting manager approval before you
                    can assign.

                  </div>

                )}

              {/* =================================================
                  ADMIN REJECTED MESSAGE
              ================================================= */}

              {isAdmin &&
                request.status === "REJECTED" && (

                  <div className="text-danger">

                    <i className="bi bi-x-circle me-2"></i>

                    This request was rejected.

                  </div>

                )}

              {/* =================================================
                  ADMIN ASSIGNED + ACTIVE
              ================================================= */}

              {isAdmin &&
                request.status === "ASSIGNED" &&
                request.assignmentStatus === "ACTIVE" && (

                  <div className="text-success">

                    <i className="bi bi-check-circle me-2"></i>

                    This asset is currently assigned to
                    the employee.

                  </div>

                )}

              {/* =================================================
                  ADMIN ASSIGNED + RETURN REQUESTED
              ================================================= */}

              {isAdmin &&
                request.status === "ASSIGNED" &&
                request.assignmentStatus ===
                  "RETURN_REQUESTED" && (

                  <div className="text-warning">

                    <i className="bi bi-arrow-return-left me-2"></i>

                    The employee has requested to return
                    this asset. Receive the asset from the
                    Assignment History page.

                  </div>

                )}

              {/* =================================================
                  ADMIN ASSIGNED + RETURNED
              ================================================= */}

              {isAdmin &&
                request.status === "ASSIGNED" &&
                request.assignmentStatus === "RETURNED" && (

                  <div className="text-secondary">

                    <i className="bi bi-arrow-return-left me-2"></i>

                    This asset was assigned to the employee
                    and has been returned.

                  </div>

                )}

              {/* =================================================
                  ADMIN ASSIGNED BUT NO ASSIGNMENT STATUS
              ================================================= */}

              {isAdmin &&
                request.status === "ASSIGNED" &&
                !request.assignmentStatus && (

                  <div className="text-muted">

                    <i className="bi bi-info-circle me-2"></i>

                    This request has been assigned.

                  </div>

                )}

              {/* =================================================
                  EMPLOYEE RETURN REQUESTED MESSAGE
              ================================================= */}

              {role === "EMPLOYEE" &&
                request.assignmentStatus ===
                  "RETURN_REQUESTED" && (

                  <div className="text-warning">

                    <i className="bi bi-hourglass-split me-2"></i>

                    Your return request has been submitted.
                    Please wait for the admin to receive
                    the asset.

                  </div>

                )}

              {/* =================================================
                  EMPLOYEE GENERAL MESSAGE
              ================================================= */}

              {role === "EMPLOYEE" &&
                request.assignmentStatus !== "RETURNED" &&
                request.assignmentStatus !==
                  "RETURN_REQUESTED" && (

                  <div className="text-muted">

                    <i className="bi bi-bell me-2"></i>

                    You'll be notified when this request
                    is processed.

                  </div>

                )}

              {/* =================================================
                  EMPLOYEE RETURNED MESSAGE
              ================================================= */}

              {role === "EMPLOYEE" &&
                request.assignmentStatus === "RETURNED" && (

                  <div className="text-secondary">

                    <i className="bi bi-arrow-return-left me-2"></i>

                    This asset has been returned.

                  </div>

                )}

              {/* =================================================
                  TECHNICIAN MESSAGE
              ================================================= */}

              {role === "TECHNICIAN" && (

                <div className="text-muted">

                  <i className="bi bi-eye me-2"></i>

                  Only viewing — no actions required.

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default RequestDetails;