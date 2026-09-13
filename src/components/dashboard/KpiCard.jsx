import { Link } from "react-router-dom";

const COLOR_TO_ICON_BOX = {
  primary: "blue",
  success: "green",
  danger: "red",
  warning: "amber",
  info: "blue",
  secondary: "gray",
};

const KpiCard = ({
  title,
  value,
  icon = "bi-bar-chart",
  color = "primary",
  delta,          // e.g. "+5%"
  deltaType,      // "up" | "down" | undefined
  deltaLabel,     // e.g. "than last week"
  subtitle,
  linkTo,
  linkLabel,
  loading = false,
}) => {
  const boxClass = COLOR_TO_ICON_BOX[color] || "gray";

  return (
    <div className="kpi-card">
      {linkTo && (
        <Link
          to={linkTo}
          className="kpi-menu-btn"
          title={linkLabel || "View details"}
        >
          <i className="bi bi-three-dots"></i>
        </Link>
      )}

      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="kpi-label">{title}</div>

          {loading ? (
            <div className="placeholder-glow" style={{ minWidth: 60 }}>
              <span
                className="placeholder col-8"
                style={{ height: "2rem" }}
              ></span>
            </div>
          ) : (
            <div className="kpi-value">{value ?? 0}</div>
          )}

          {(delta || subtitle) && (
            <div
              className={`kpi-delta ${
                deltaType === "up"
                  ? "up"
                  : deltaType === "down"
                  ? "down"
                  : ""
              }`}
            >
              {delta && (
                <>
                  <i
                    className={`bi ${
                      deltaType === "down"
                        ? "bi-arrow-down-short"
                        : "bi-arrow-up-short"
                    }`}
                  ></i>
                  <strong>{delta}</strong>{" "}
                </>
              )}

              {deltaLabel || subtitle}
            </div>
          )}
        </div>

        <div className={`kpi-icon-box ${boxClass}`}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;