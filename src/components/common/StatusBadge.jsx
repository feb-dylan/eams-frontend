import { formatEnum } from "../../utils/format";

// One place for status colours (previously copied into 8+ pages).
const COLORS = {
  // assets
  AVAILABLE: "bg-success",
  ASSIGNED: "bg-primary",
  DAMAGED: "bg-danger",
  MAINTENANCE: "bg-warning text-dark",
  RETIRED: "bg-secondary",
  // requests
  PENDING: "bg-warning text-dark",
  APPROVED: "bg-info text-dark",
  REJECTED: "bg-danger",
  // assignments
  ACTIVE: "bg-success",
  RETURN_REQUESTED: "bg-warning text-dark",
  RETURNED: "bg-secondary",
  // damage
  REPORTED: "bg-danger",
  UNDER_REVIEW: "bg-warning text-dark",
  REPAIRING: "bg-primary",
  RESOLVED: "bg-success",
  // maintenance
  SCHEDULED: "bg-info text-dark",
  IN_PROGRESS: "bg-primary",
  COMPLETED: "bg-success",
  CANCELLED: "bg-secondary",
  // AI severity / priority
  LOW: "bg-success",
  NORMAL: "bg-secondary",
  MEDIUM: "bg-warning text-dark",
  HIGH: "bg-danger",
  URGENT: "bg-danger",
  CRITICAL: "bg-dark",
  // health
  GOOD: "bg-success",
  FAIR: "bg-warning text-dark",
  POOR: "bg-danger",
  KEEP: "bg-success",
  MONITOR: "bg-warning text-dark",
  REPLACE: "bg-danger",
  // misc
  OPEN: "bg-primary",
  CLOSED: "bg-secondary",
  FOUND: "bg-success",
  WRONG_LOCATION: "bg-warning text-dark",
};

/** <StatusBadge value="RETURN_REQUESTED" /> -> coloured "Return requested" */
const StatusBadge = ({ value, className = "" }) => {
  if (!value) return <span className="text-muted">-</span>;
  // ASSIGNED for requests means "done", keep it readable for every entity
  const color = COLORS[value] || "bg-secondary";
  return <span className={`badge ${color} ${className}`}>{formatEnum(value)}</span>;
};

export default StatusBadge;
