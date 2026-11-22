import { Link } from "react-router-dom";
import { fileUrl } from "../../config";
import { formatDateTime, formatRelative } from "../../utils/format";

const ICONS = {
  REGISTERED: ["bi-box-seam", "primary"],
  REQUESTED: ["bi-file-earmark-text", "secondary"],
  REQUEST_APPROVED: ["bi-check-circle", "success"],
  REQUEST_REJECTED: ["bi-x-circle", "danger"],
  ASSIGNED: ["bi-person-check", "primary"],
  RETURNED: ["bi-arrow-return-left", "secondary"],
  DAMAGE_REPORTED: ["bi-exclamation-octagon", "danger"],
  DAMAGE_RESOLVED: ["bi-patch-check", "success"],
  MAINTENANCE_STARTED: ["bi-tools", "warning"],
  MAINTENANCE_COMPLETED: ["bi-wrench-adjustable", "success"],
  MAINTENANCE_CANCELLED: ["bi-slash-circle", "secondary"],
  STATUS_CHANGED: ["bi-arrow-left-right", "info"],
  RETIRED: ["bi-archive", "dark"],
  AUDIT_SCANNED: ["bi-qr-code-scan", "info"],
};

/** Vertical history of everything that happened to one asset (oldest first). */
const AssetTimeline = ({ events }) => {
  if (!events) return null;
  if (events.length === 0) return <p className="text-muted mb-0">No history yet.</p>;

  return (
    <ol className="list-unstyled mb-0">
      {events.map((e, i) => {
        const [icon, color] = ICONS[e.type] || ["bi-dot", "secondary"];
        return (
          <li key={`${e.type}-${e.at}-${i}`} className="d-flex gap-3 pb-3 position-relative">
            <div className={`rounded-circle bg-${color} bg-opacity-10 text-${color} d-flex align-items-center
                             justify-content-center flex-shrink-0`} style={{ width: 36, height: 36 }}>
              <i className={`bi ${icon}`} aria-hidden="true"></i>
            </div>
            <div className="flex-grow-1 border-bottom pb-2">
              <div className="d-flex justify-content-between flex-wrap gap-1">
                <span className="fw-semibold">
                  {e.link ? <Link to={e.link} className="text-decoration-none">{e.title}</Link> : e.title}
                </span>
                <span className="small text-muted" title={formatDateTime(e.at)}>{formatRelative(e.at)}</span>
              </div>
              {e.description && <div className="small text-muted">{e.description}</div>}
              {e.actor && <div className="small text-muted">by {e.actor}</div>}
              {e.imageUrl && e.type === "DAMAGE_REPORTED" && (
                <img src={fileUrl(e.imageUrl)} alt="Damage" className="rounded border mt-2"
                     style={{ width: 96, height: 72, objectFit: "cover" }} />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default AssetTimeline;
