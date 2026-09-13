const ReportSummaryCard = ({
  label,
  value,
  icon = "bi-bar-chart",
  color = "primary",
}) => {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-muted small text-uppercase fw-semibold">
              {label}
            </div>

            <div
              className={`fw-bold text-${color} mt-2`}
              style={{ fontSize: "1.6rem" }}
            >
              {value ?? 0}
            </div>
          </div>

          <div
            className={`bg-${color}-subtle text-${color} rounded-circle d-flex align-items-center justify-content-center`}
            style={{ width: "42px", height: "42px" }}
          >
            <i className={`bi ${icon}`}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummaryCard;