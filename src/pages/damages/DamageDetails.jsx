import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import damageApi from "../../services/damageApi";

import { useAuth } from "../../context/AuthContext";

const DamageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { role } = useAuth();

  const [report, setReport] = useState(null);

  const [status, setStatus] = useState("");
  const [resolutionNote, setResolutionNote] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isTechnician = role === "TECHNICIAN";

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await damageApi.getDamageReportById(id);

      setReport(data);
      setStatus(data.status || "");
      setResolutionNote(
        data.resolutionNote || ""
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load damage report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setUpdateLoading(true);
      setError("");
      setSuccess("");

      const updated =
        await damageApi.updateDamageReport(
          id,
          {
            status,
            resolutionNote:
              resolutionNote.trim() || null,
          }
        );

      setReport(updated);

      setSuccess(
        "Damage report updated successfully."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to update damage report."
      );
    } finally {
      setUpdateLoading(false);
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

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          Loading damage report...
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Damage Report #{report.id}</h2>

          <p className="text-muted mb-0">
            Damage report details
          </p>
        </div>

        <Link
          to={
            role === "EMPLOYEE"
              ? "/damage"
              : "/damage/all"
          }
          className="btn btn-outline-secondary"
        >
          Back
        </Link>
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

      <div className="row g-4">
        {/* Details */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                Report Information
              </h5>
            </div>

            <div className="card-body">
              <div className="row mb-3">
                <div className="col-sm-4 fw-bold">
                  Report ID
                </div>

                <div className="col-sm-8">
                  {report.id}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 fw-bold">
                  Asset
                </div>

                <div className="col-sm-8">
                  <strong>
                    {report.assetCode}
                  </strong>

                  <br />

                  {report.assetName}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 fw-bold">
                  Employee
                </div>

                <div className="col-sm-8">
                  <strong>
                    {report.employeeName}
                  </strong>

                  <br />

                  {report.employeeCode}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 fw-bold">
                  Reported Date
                </div>

                <div className="col-sm-8">
                  {formatDate(
                    report.reportedDate
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 fw-bold">
                  Status
                </div>

                <div className="col-sm-8">
                  <span
                    className={`badge ${getStatusBadge(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 fw-bold">
                  Description
                </div>

                <div className="col-sm-8">
                  <div className="border rounded p-3 bg-light">
                    {report.description}
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 fw-bold">
                  Evidence
                </div>

                <div className="col-sm-8">
                  {report.evidenceUrl ? (
                    <a
                      href={report.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Evidence
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-sm-4 fw-bold">
                  Resolution Note
                </div>

                <div className="col-sm-8">
                  {report.resolutionNote || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technician update */}
        <div className="col-lg-5">
          {isTechnician ? (
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  Update Damage Report
                </h5>
              </div>

              <div className="card-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">
                      Status
                    </label>

                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target.value
                        )
                      }
                      disabled={updateLoading}
                    >
                      <option value="REPORTED">
                        REPORTED
                      </option>

                      <option value="UNDER_REVIEW">
                        UNDER_REVIEW
                      </option>

                      <option value="REPAIRING">
                        REPAIRING
                      </option>

                      <option value="RESOLVED">
                        RESOLVED
                      </option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Resolution Note
                    </label>

                    <textarea
                      className="form-control"
                      rows="6"
                      maxLength="1000"
                      placeholder="Enter resolution details..."
                      value={resolutionNote}
                      onChange={(e) =>
                        setResolutionNote(
                          e.target.value
                        )
                      }
                      disabled={updateLoading}
                    />

                    <div className="form-text">
                      {
                        resolutionNote.length
                      }
                      /1000 characters
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      "Update Damage Report"
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  Status Information
                </h5>
              </div>

              <div className="card-body">
                <p className="mb-0">
                  Damage reports can be updated by
                  technicians.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DamageDetails;