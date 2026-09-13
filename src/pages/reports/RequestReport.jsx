import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import reportApi from "../../services/reportApi";

import ReportSummaryCard from "../../components/reports/ReportSummaryCard";
import ExportButtons from "../../components/reports/ExportButtons";

const RequestReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await reportApi.getRequestReport();
      setReport(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load request report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = report
    ? [
        { status: "Pending", count: report.pending },
        { status: "Approved", count: report.approved },
        { status: "Rejected", count: report.rejected },
      ]
    : [];

  const columns = [
    { header: "Status", accessor: "status" },
    { header: "Count", accessor: "count" },
  ];

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Request Report</h2>

          <p className="text-muted mb-0">
            Asset request volumes and approval outcomes.
          </p>
        </div>

        <div className="d-flex gap-2">
          <ExportButtons
            fileName="request-report"
            title="Request Report"
            columns={columns}
            rows={rows}
            disabled={loading}
          />

          <Link to="/reports" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i>
            Back
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"></div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Total Requests"
                value={report.total}
                icon="bi-file-earmark-text"
                color="primary"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Pending"
                value={report.pending}
                icon="bi-hourglass-split"
                color="warning"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Approved"
                value={report.approved}
                icon="bi-check2-circle"
                color="success"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Rejected"
                value={report.rejected}
                icon="bi-x-circle"
                color="danger"
              />
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                <i className="bi bi-table me-2"></i>
                Summary Table
              </h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Status</th>
                    <th className="text-end">Count</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.status}>
                      <td>{row.status}</td>

                      <td className="text-end fw-semibold">
                        {row.count}
                      </td>
                    </tr>
                  ))}

                  <tr className="table-primary">
                    <td className="fw-bold">Total</td>

                    <td className="text-end fw-bold">
                      {report.total}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RequestReport;