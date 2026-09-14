import { useEffect, useState } from "react";

import damageApi from "../../services/damageApi";
import assetRequestApi from "../../services/assetRequestApi";
import { useAuth } from "../../context/AuthContext";

const MyDamageReports = () => {
  const { employeeId } = useAuth();

  const [reports, setReports] = useState([]);
  const [assets, setAssets] = useState([]);

  const [damageData, setDamageData] = useState({
    assetId: "",
    description: "",
    evidenceUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReports = async () => {
    try {
      if (!employeeId) {
        return;
      }

      const data =
        await damageApi.getMyDamageReports(employeeId);

      setReports(data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load your damage reports."
      );
    }
  };

  const loadAssets = async () => {
    try {
      if (!employeeId) {
        return;
      }

      const assignments =
        await assetRequestApi.getMyAssignedAssets(
          employeeId
        );

      const assignedAssets = assignments
        .filter(
          (assignment) =>
            assignment.status === "ACTIVE" ||
            assignment.status === "RETURN_REQUESTED"
        )
        .map((assignment) => ({
          id: assignment.assetId,
          assetCode: assignment.assetCode,
          name: assignment.assetName,
        }));

      setAssets(assignedAssets);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load your assigned assets."
      );
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadReports(),
        loadAssets(),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setDamageData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!employeeId) {
      setError("Employee information is not available.");
      return;
    }

    if (!damageData.assetId) {
      setError("Please select an asset.");
      return;
    }

    if (!damageData.description.trim()) {
      setError("Please enter a damage description.");
      return;
    }

    try {
      setSubmitting(true);

      await damageApi.createDamageReport({
        employeeId: employeeId,
        assetId: Number(damageData.assetId),
        description: damageData.description,
        evidenceUrl: damageData.evidenceUrl,
      });

      setSuccess(
        "Damage report submitted successfully."
      );

      setDamageData({
        assetId: "",
        description: "",
        evidenceUrl: "",
      });

      await loadReports();
      await loadAssets();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to submit damage report."
      );
    } finally {
      setSubmitting(false);
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
      <div className="mb-4">
        <h2>My Damage Reports</h2>

        <p className="text-muted mb-0">
          Report and track damage for assets currently
          assigned to you.
        </p>
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

      {/* Create Damage Report */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            Report Asset Damage
          </h5>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                htmlFor="assetId"
                className="form-label"
              >
                Asset
              </label>

              <select
                id="assetId"
                name="assetId"
                className="form-select"
                value={damageData.assetId}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">
                  Select an assigned asset
                </option>

                {assets.map((asset) => (
                  <option
                    key={asset.id}
                    value={asset.id}
                  >
                    {asset.assetCode} - {asset.name}
                  </option>
                ))}
              </select>

              {assets.length === 0 && !loading && (
                <small className="text-muted">
                  You currently have no assigned assets
                  available for reporting.
                </small>
              )}
            </div>

            <div className="mb-3">
              <label
                htmlFor="description"
                className="form-label"
              >
                Damage Description
              </label>

              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="4"
                placeholder="Describe the damage..."
                value={damageData.description}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="evidenceUrl"
                className="form-label"
              >
                Evidence URL
              </label>

              <input
                type="text"
                id="evidenceUrl"
                name="evidenceUrl"
                className="form-control"
                placeholder="Optional evidence URL"
                value={damageData.evidenceUrl}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="btn btn-danger"
              disabled={
                submitting ||
                loading ||
                assets.length === 0
              }
            >
              {submitting
                ? "Submitting..."
                : "Report Damage"}
            </button>
          </form>
        </div>
      </div>

      {/* My Reports */}
      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">
            My Damage Reports
          </h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>Description</th>
                <th>Reported Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-4"
                  >
                    Loading damage reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-4"
                  >
                    You have no damage reports.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>

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

                    <td>
                      {report.description || "-"}
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