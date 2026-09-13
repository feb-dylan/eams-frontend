import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import reportApi from "../../services/reportApi";

import ReportSummaryCard from "../../components/reports/ReportSummaryCard";
import ExportButtons from "../../components/reports/ExportButtons";
import MaintenanceStatusChart from "../../components/dashboard/MaintenanceStatusChart";

const MaintenanceReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await reportApi.getMaintenanceReport();
      setReport(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load maintenance report."
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
          metric: "In Progress",
          value: report.inProgress,
        },
        {
          metric: "Completed",
          value: report.completed,
        },
        {
          metric: "Cancelled",
          value: report.cancelled,
        },
        {
          metric: "Total Repair Cost",
          value: Number(report.totalRepairCost || 0).toFixed(2),
        },
      ]
    : [];

  const columns = [
    { header: "Metric", accessor: "metric" },
    { header: "Value", accessor: "value" },
  ];

  const chartData = report
    ? {
        scheduledMaintenance: 0,
        inProgressMaintenance: report.inProgress,
        completedMaintenance: report.completed,
        cancelledMaintenance: report.cancelled,
      }
    : {};

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Maintenance Report</h2>

          <p className="text-muted mb-0">
            Maintenance activity and total repair cost.
          </p>
        </div>

        <div className="d-flex gap-2">
          <ExportButtons
            fileName="maintenance-report"
            title="Maintenance Report"
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
                label="Total Maintenance"
                value={report.total}
                icon="bi-clipboard-check"
                color="primary"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="In Progress"
                value={report.inProgress}
                icon="bi-hourglass-split"
                color="info"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Completed"
                value={report.completed}
                icon="bi-check2-all"
                color="success"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Cancelled"
                value={report.cancelled}
                icon="bi-x-circle"
                color="secondary"
              />
            </div>

            <div className="col-sm-6 col-lg-3">
              <ReportSummaryCard
                label="Total Repair Cost"
                value={Number(report.totalRepairCost || 0).toFixed(2)}
                icon="bi-cash-coin"
                color="success"
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0 pt-3">
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2 text-warning"></i>
                    Maintenance by Status
                  </h5>
                </div>

                <div className="card-body">
                  <MaintenanceStatusChart dashboard={chartData} />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
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
                        <th>Metric</th>
                        <th className="text-end">Value</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.metric}>
                          <td>{row.metric}</td>

                          <td className="text-end fw-semibold">
                            {row.value}
                          </td>
                        </tr>
                      ))}
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

export default MaintenanceReport;