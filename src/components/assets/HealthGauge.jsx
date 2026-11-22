import StatusBadge from "../common/StatusBadge";
import { formatDate, formatMoney } from "../../utils/format";

const COLOR = { GOOD: "#198754", FAIR: "#ffc107", POOR: "#dc3545" };

/** Radial health score (0-100) with the repair-or-replace recommendation. */
const HealthGauge = ({ health }) => {
  if (!health) return null;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (health.score / 100) * circumference;
  const color = COLOR[health.band] || "#6c757d";

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Asset health</h5>
        <StatusBadge value={health.recommendation} />
      </div>
      <div className="card-body">
        <div className="d-flex align-items-center gap-4 flex-wrap">
          <svg width="130" height="130" viewBox="0 0 130 130" role="img"
               aria-label={`Health score ${health.score} out of 100`}>
            <circle cx="65" cy="65" r={radius} fill="none" stroke="#e9ecef" strokeWidth="12" />
            <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="12"
                    strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"
                    transform="rotate(-90 65 65)" />
            <text x="65" y="62" textAnchor="middle" fontSize="30" fontWeight="700" fill="currentColor">
              {health.score}
            </text>
            <text x="65" y="84" textAnchor="middle" fontSize="12" fill="#6c757d">{health.band}</text>
          </svg>

          <ul className="small mb-0 ps-3 flex-grow-1">
            {health.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>

        <div className="row text-center g-2 mt-3">
          <div className="col-6 col-md-3">
            <div className="small text-muted">Book value</div>
            <div className="fw-semibold">{formatMoney(health.bookValue)}</div>
          </div>
          <div className="col-6 col-md-3">
            <div className="small text-muted">Repairs</div>
            <div className="fw-semibold">{health.repairCount} · {formatMoney(health.totalRepairCost)}</div>
          </div>
          <div className="col-6 col-md-3">
            <div className="small text-muted">Total cost</div>
            <div className="fw-semibold">{formatMoney(health.totalCostOfOwnership)}</div>
          </div>
          <div className="col-6 col-md-3">
            <div className="small text-muted">Warranty</div>
            <div className={`fw-semibold ${health.underWarranty ? "text-success" : "text-muted"}`}>
              {health.warrantyExpiryDate ? formatDate(health.warrantyExpiryDate) : "None"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthGauge;
