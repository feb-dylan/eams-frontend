import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import assetRequestApi from "../../services/assetRequestApi";
import assetApi from "../../services/assetApi";

import RequestForm from "../../components/requests/RequestForm";

const MyRequests = () => {
  const {
    employeeId,
    refreshEmployee,
  } = useAuth();

  const [requests, setRequests] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileChecked, setProfileChecked] = useState(
    !!employeeId
  );

  // =========================================================
  // CHECK / REFRESH EMPLOYEE PROFILE
  // =========================================================

  useEffect(() => {
    const checkEmployeeProfile = async () => {
      // Employee ID already exists
      if (employeeId) {
        setProfileChecked(true);
        return;
      }

      // Employee ID is missing.
      // Try to fetch employee profile from backend.
      try {
        setLoading(true);
        setError("");

        await refreshEmployee();

        // refreshEmployee() updates employeeId.
        // This effect will run again.
      } catch (err) {
        console.error(
          "Employee profile not found:",
          err
        );

        setProfileChecked(true);
        setLoading(false);
      }
    };

    checkEmployeeProfile();
  }, [employeeId, refreshEmployee]);

  // =========================================================
  // LOAD MY REQUESTS
  // =========================================================

  useEffect(() => {
    const loadRequests = async () => {
      if (!employeeId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await assetRequestApi.getMyRequests(
            employeeId
          );

        setRequests(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Failed to load requests:",
          err
        );

        setError(
          err.response?.data?.message ||
            (typeof err.response?.data === "string"
              ? err.response.data
              : "Failed to load your requests.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [employeeId]);

  // =========================================================
  // LOAD AVAILABLE ASSETS
  // =========================================================

  const loadAvailableAssets = async () => {
    try {
      setAssetsLoading(true);

      const data =
        await assetApi.getAssetsByStatus(
          "AVAILABLE"
        );

      console.log(
        "Available assets:",
        data
      );

      // If backend returns an array
      if (Array.isArray(data)) {
        setAvailableAssets(data);
      }

      // If backend returns Spring Page
      else if (Array.isArray(data?.content)) {
        setAvailableAssets(data.content);
      }

      // Unexpected response
      else {
        console.warn(
          "Unexpected available assets response:",
          data
        );

        setAvailableAssets([]);
      }
    } catch (err) {
      console.error(
        "Failed to load available assets:",
        err
      );

      setAvailableAssets([]);

      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : "Failed to load available assets.")
      );
    } finally {
      setAssetsLoading(false);
    }
  };

  // =========================================================
  // LOAD AVAILABLE ASSETS WHEN EMPLOYEE ID EXISTS
  // =========================================================

  useEffect(() => {
    if (!employeeId) {
      return;
    }

    loadAvailableAssets();
  }, [employeeId]);

  // =========================================================
  // OPEN NEW REQUEST FORM
  // =========================================================

  const handleOpenForm = async () => {
    setError("");
    setSuccess("");

    if (!employeeId) {
      setError(
        "Employee profile is not available. Please complete your employee profile first."
      );
      return;
    }

    // Get the latest available assets
    await loadAvailableAssets();

    setShowForm(true);
  };

  // =========================================================
  // CREATE REQUEST
  // =========================================================

  const handleCreate = async (data) => {
    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      // Make sure employeeId exists
      if (!employeeId) {
        throw new Error(
          "Employee profile is not available. Please complete your employee profile first."
        );
      }

      // Validate asset
      if (!data.assetId) {
        throw new Error(
          "Please select an asset."
        );
      }

      // Validate reason
      if (!data.reason?.trim()) {
        throw new Error(
          "Please provide a reason."
        );
      }

      // Create request
      await assetRequestApi.createRequest({
        employeeId: employeeId,
        assetId: Number(data.assetId),
        reason: data.reason.trim(),
      });

      // Success
      setSuccess(
        "Request submitted successfully."
      );

      setShowForm(false);

      // Reload requests
      const updatedRequests =
        await assetRequestApi.getMyRequests(
          employeeId
        );

      setRequests(
        Array.isArray(updatedRequests)
          ? updatedRequests
          : []
      );

      // Reload available assets
      await loadAvailableAssets();

    } catch (err) {
      console.error(
        "Failed to create asset request:",
        err
      );

      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : err.message) ||
          "Failed to submit asset request."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div
          className="spinner-border"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="mt-3">
          Loading requests...
        </p>
      </div>
    );
  }

  // =========================================================
  // NO EMPLOYEE PROFILE
  // =========================================================

  if (!employeeId && profileChecked) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h5 className="alert-heading">
            Employee profile not found
          </h5>

          <p className="mb-0">
            Please complete your employee profile
            before creating asset requests.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="container-fluid px-4 py-4">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            My Requests
          </h2>

          <p className="text-muted mb-0">
            View and manage your asset requests.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenForm}
          disabled={assetsLoading}
        >
          {assetsLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>

              Loading Assets...
            </>
          ) : (
            <>
              <i className="bi bi-plus-lg me-2"></i>
              New Request
            </>
          )}
        </button>

      </div>

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="alert alert-success">
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* =====================================================
          REQUEST FORM
      ====================================================== */}

      {showForm && (
        <div className="card shadow-sm border-0 mb-4">

          <div className="card-header bg-white border-0 pt-3">

            <div className="d-flex justify-content-between align-items-center">

              <h5 className="mb-0">
                Create Asset Request
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={() => setShowForm(false)}
                disabled={formLoading}
              ></button>

            </div>

          </div>

          <div className="card-body">

            {assetsLoading ? (
              <div className="text-center py-4">

                <div
                  className="spinner-border"
                  role="status"
                >
                  <span className="visually-hidden">
                    Loading...
                  </span>
                </div>

                <p className="text-muted mt-3 mb-0">
                  Loading available assets...
                </p>

              </div>
            ) : availableAssets.length === 0 ? (

              <div className="alert alert-warning mb-0">

                <i className="bi bi-box-seam me-2"></i>

                There are currently no available
                assets to request.

              </div>

            ) : (

              <RequestForm
                assets={availableAssets}
                onSubmit={handleCreate}
                onCancel={() =>
                  setShowForm(false)
                }
                loading={formLoading}
              />

            )}

          </div>

        </div>
      )}

      {/* =====================================================
          REQUEST LIST
      ====================================================== */}

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white border-0 pt-3">

          <h5 className="mb-0">
            Request History
          </h5>

        </div>

        <div className="card-body">

          {requests.length === 0 ? (

            <div className="text-center text-muted py-5">

              <i className="bi bi-inbox fs-1 d-block mb-3"></i>

              <p className="mb-0">
                You have no asset requests yet.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table align-middle">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Asset ID</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Request Date</th>
                  </tr>
                </thead>

                <tbody>

                  {requests.map((request) => (

                    <tr key={request.id}>

                      <td>
                        #{request.id}
                      </td>

                      <td>
                        {request.assetId ?? "-"}
                      </td>

                      <td>
                        {request.reason}
                      </td>

                      <td>
                        <span className="badge bg-secondary">
                          {request.status}
                        </span>
                      </td>

                      <td>
                        {request.requestDate
                          ? new Date(
                              request.requestDate
                            ).toLocaleString()
                          : "-"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default MyRequests;