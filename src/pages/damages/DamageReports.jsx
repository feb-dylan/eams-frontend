import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import damageApi from "../../services/damageApi";
import assetApi from "../../services/assetApi";
import DamageForm from "../../components/damages/DamageForm";

import { useAuth } from "../../context/AuthContext";

const MyDamageReports = () => {
  const { employeeId } = useAuth();

  const [reports, setReports] = useState([]);
  const [assets, setAssets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      if (!employeeId) {
        setError(
          "Employee information is not available."
        );
        return;
      }

      const data =
        await damageApi.getMyDamageReports(
          employeeId
        );

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

  const loadAssets = async () => {
    try {
      const data =
        await assetApi.getAssets();

      // Retired assets should not be reportable.
      const reportableAssets = data.filter(
        (asset) => asset.status !== "RETIRED"
      );

      setAssets(reportableAssets);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load assets."
      );
    }
  };

  useEffect(() => {
    loadReports();
    loadAssets();
  }, [employeeId]);

  const handleSubmit = async (damageData) => {
    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      await damageApi.createDamageReport({
        employeeId: employeeId,
        assetId: damageData.assetId,
        description: damageData.description,
        evidenceUrl: damageData.evidenceUrl,
      });

      setSuccess(
        "Damage report submitted successfully."
      );

      setShowForm(false);

      await loadReports();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to submit damage report."
      );

      throw error;
    } finally {
      setFormLoading(false);
    }
  };

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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Damage Reports</h2>

          <p className="text-muted mb-0">
            Report and track damaged company assets.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setSuccess("");
            setError("");
          }}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Report Damage
        </button>
      </div>

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

      {/* Form */}
      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              Report Damaged Asset
            </h5>
          </div>

          <div className="card-body">
            {assets.length === 0 ? (
              <div className="alert alert-warning">
                No reportable assets were found.
              </div>
            ) : (
              <DamageForm
                assets={assets}
                onSubmit={handleSubmit}
                onCancel={() =>
                  setShowForm(false)
                }
                loading={formLoading}
              />
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
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
                    colSpan="6"
                    className="text-center py-4"
                  >
                    Loading damage reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4"
                  >
                    No damage reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>

                    <td>
                      <strong>
                        {report.assetCode}
                      </strong>

                      <br />

                      <small className="text-muted">
                        {report.assetName}
                      </small>
                    </td>

                    <td>
                      <span
                        title={report.description}
                      >
                        {report.description.length >
                        70
                          ? `${report.description.substring(
                              0,
                              70
                            )}...`
                          : report.description}
                      </span>
                    </td>

                    <td>
                      {formatDate(
                        report.reportedDate
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>

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

export default MyDamageReports;