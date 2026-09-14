import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import damageApi from "../../services/damageApi";

const AdminDamageReports = () => {
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await damageApi.getAllDamageReports();

      setReports(data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load damage reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "REPORTED":
        return "bg-danger";

      case "UNDER_REVIEW":
        return "bg-warning text-dark";

      case "REPAIRING":
        return "bg-primary";

      case "RESOLVED":
        return "bg-success";

      default:
        return "bg-secondary";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Damage Reports</h2>

          <p className="text-muted mb-0">
            View and manage all reported damaged
            company assets.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadReports}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>

          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">
            All Damage Reports
          </h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Asset</th>
                <th>Description</th>
                <th>Reported Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4"
                  >
                    Loading damage reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4"
                  >
                    No damage reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>

                    {/* Employee */}
                    <td>
                      {report.employeeName ? (
                        <>
                          <strong>
                            {report.employeeName}
                          </strong>

                          <br />

                          <small className="text-muted">
                            {report.employeeCode || "-"}
                          </small>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Asset */}
                    <td>
                      {report.assetCode ? (
                        <>
                          <strong>
                            {report.assetCode}
                          </strong>

                          <br />

                          <small className="text-muted">
                            {report.assetName || "-"}
                          </small>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Description */}
                    <td>
                      <span
                        title={report.description}
                      >
                        {report.description &&
                        report.description.length > 70
                          ? `${report.description.substring(
                              0,
                              70
                            )}...`
                          : report.description || "-"}
                      </span>
                    </td>

                    {/* Date */}
                    <td>
                      {formatDate(
                        report.reportedDate
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`badge ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td>
                      <Link
                        to={`/damage/${report.id}`}
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

export default AdminDamageReports;