import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import employeeApi from "../../services/employeeApi";
import { useAuth } from "../../context/AuthContext";

const MyAssets = () => {
  const { employeeId } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [returningId, setReturningId] = useState(null);

  const loadMyAssets = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await employeeApi.getMyAssignedAssets(employeeId);

      setAssets(data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load your assigned assets."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadMyAssets();
    }
  }, [employeeId]);

  const handleReturnRequest = async (assignmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to request the return of this asset?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setReturningId(assignmentId);
      setError("");

      await employeeApi.requestAssetReturn(
        assignmentId,
        employeeId,
        ""
      );

      await loadMyAssets();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to request asset return."
      );

    } finally {
      setReturningId(null);
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
            Loading your assets...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      {/* PAGE HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            My Assets
          </h2>

          <p className="text-muted mb-0">
            Assets currently assigned to you
          </p>

        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={loadMyAssets}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* ASSETS CARD */}

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white d-flex justify-content-between align-items-center">

          <h5 className="mb-0">

            <i className="bi bi-pc-display me-2 text-primary"></i>

            Assigned Assets

          </h5>

          <span className="badge bg-primary">
            {assets.length}
          </span>

        </div>

        <div className="card-body p-0">

          {assets.length === 0 ? (

            <div className="text-center py-5">

              <i className="bi bi-inbox fs-1 text-muted"></i>

              <h5 className="mt-3">
                No assigned assets
              </h5>

              <p className="text-muted mb-0">
                You currently have no assets assigned to you.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th>Assignment ID</th>
                    <th>Asset ID</th>
                    <th>Assigned Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {assets.map((asset) => {

                    const returnRequested =
                      asset.status === "RETURN_REQUESTED";

                    return (
                      <tr key={asset.id}>

                        <td>
                          #{asset.id}
                        </td>

                        <td>

                          <Link
                            to={`/assets/${asset.assetId}`}
                            className="text-decoration-none fw-semibold"
                          >
                            Asset #{asset.assetId}
                          </Link>

                        </td>

                        <td>
                          {asset.assignedDate || "-"}
                        </td>

                        <td>

                          {returnRequested ? (

                            <span className="badge bg-warning text-dark">
                              RETURN REQUESTED
                            </span>

                          ) : (

                            <span className="badge bg-success">
                              {asset.status}
                            </span>

                          )}

                        </td>

                        <td>

                          {returnRequested ? (

                            <span className="text-muted">
                              Waiting for admin
                            </span>

                          ) : (

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleReturnRequest(
                                  asset.id
                                )
                              }
                              disabled={
                                returningId === asset.id
                              }
                            >

                              {returningId === asset.id ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-1"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>

                                  Requesting...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-arrow-return-left me-1"></i>
                                  Return Asset
                                </>
                              )}

                            </button>

                          )}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default MyAssets;