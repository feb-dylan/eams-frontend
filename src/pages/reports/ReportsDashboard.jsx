import { Link, useNavigate } from "react-router-dom";

const REPORTS = [
  {
    to: "/reports/assets",
    title: "Asset Report",
    description:
      "Distribution and status breakdown of all assets.",
    icon: "bi-box-seam",
    color: "primary",
  },
  {
    to: "/reports/requests",
    title: "Request Report",
    description:
      "Asset request volumes and approval outcomes.",
    icon: "bi-file-earmark-text",
    color: "info",
  },
  {
    to: "/reports/maintenance",
    title: "Maintenance Report",
    description:
      "Maintenance activity and total repair cost.",
    icon: "bi-tools",
    color: "warning",
  },
  {
    to: "/reports/damage",
    title: "Damage Report",
    description:
      "Damage reports grouped by status and progress.",
    icon: "bi-exclamation-octagon",
    color: "danger",
  },
  {
    to: "/reports/assignments",
    title: "Assignment Report",
    description:
      "Asset assignments, active and returned.",
    icon: "bi-person-check",
    color: "success",
  },
];

const ReportsDashboard = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            Reports
          </h2>

          <p className="text-muted mb-0">
            Generate, review, and export system-wide reports.
          </p>
        </div>

        {/* Back Button */}
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back
        </button>
      </div>

      {/* Report Cards */}
      <div className="row g-3">
        {REPORTS.map((report) => (
          <div
            key={report.to}
            className="col-md-6 col-lg-4"
          >
            <Link
              to={report.to}
              className="text-decoration-none text-dark"
            >
              <div className="card shadow-sm border-0 h-100 report-card">
                <div className="card-body d-flex align-items-start">
                  {/* Icon */}
                  <div
                    className={`bg-${report.color}-subtle text-${report.color} rounded-circle d-flex align-items-center justify-content-center me-3`}
                    style={{
                      width: "56px",
                      height: "56px",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className={`bi ${report.icon} fs-4`}
                    ></i>
                  </div>

                  {/* Content */}
                  <div>
                    <h5 className="mb-1">
                      {report.title}
                    </h5>

                    <p className="text-muted small mb-0">
                      {report.description}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="card-footer bg-transparent border-0 pt-0">
                  <span
                    className={`small text-${report.color} fw-semibold`}
                  >
                    Open report{" "}
                    <i className="bi bi-arrow-right ms-1"></i>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Card Hover Style */}
      <style>{`
        .report-card {
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .report-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 0.5rem 1rem rgba(0, 0, 0, 0.12) !important;
        }
      `}</style>
    </div>
  );
};

export default ReportsDashboard;