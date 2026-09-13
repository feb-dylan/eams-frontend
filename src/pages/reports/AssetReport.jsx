import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import reportApi from "../../services/reportApi";

import ReportSummaryCard from "../../components/reports/ReportSummaryCard";
import ExportButtons from "../../components/reports/ExportButtons";
import AssetStatusChart from "../../components/dashboard/AssetStatusChart";

const AssetReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await reportApi.getAssetReport();
      setReport(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load asset report."
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
        {
          status: "Available",
          count: report.available,
        },
        {
          status: "Assigned",
          count: report.assigned,
        },
        {
          status: "Damaged",
          count: report.damaged,
        },
        {
          status: "Maintenance",
          count: report.maintenance,
        },
        {
          status: "Retired",
          count: report.retired,
        },
      ]
    : [];

  const columns = [
    { header: "Status", accessor: "status" },
    { header: "Count", accessor: "count" },
  ];

  // chart-friendly shape (uses same keys as AssetStatusChart)
  const chartData = report
    ? {
        availableAssets: report.available,
        assignedAssets: report.assigned,
        damagedAssets: report.damaged,
        maintenanceAssets: report.maintenance,
        retiredAssets: report.retired,
      }
    : {};

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Asset Report</h2>

          <p className="text-muted mb-0">
            Distribution and status breakdown of all assets.
          </p>
        </div>

        <div className="d-flex gap-2">
          <ExportButtons
            fileName="asset-report"
            title="Asset Report"
            columns={columns}
            rows={rows}
            disabled={loading}
          />

          <Link
            to="/reports"
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Total Assets"
                value={report.total}
                icon="bi-box-seam"
                color="primary"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Available"
                value={report.available}
                icon="bi-check-circle"
                color="success"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Assigned"
                value={report.assigned}
                icon="bi-person-check"
                color="info"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Damaged"
                value={report.damaged}
                icon="bi-exclamation-octagon"
                color="danger"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Maintenance"
                value={report.maintenance}
                icon="bi-tools"
                color="warning"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Retired"
                value={report.retired}
                icon="bi-archive"
                color="secondary"
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0 pt-3">
                  <h5 className="mb-0">
                    <i className="bi bi-pie-chart me-2 text-primary"></i>
                    Asset Distribution
                  </h5>
                </div>

                <div className="card-body">
                  <AssetStatusChart dashboard={chartData} />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0 pt-3">
                  <h5 className="mb-0">
                    <i className="bi bi-table me-2 text-primary"></i>
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssetReport;