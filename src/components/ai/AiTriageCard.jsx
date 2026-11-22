import StatusBadge from "../common/StatusBadge";
import { formatEnum, formatMoney, formatRelative } from "../../utils/format";

/** Shows the AI's damage assessment (or its progress). */
const AiTriageCard = ({ report, canRerun, onRerun, busy }) => {
  const status = report.aiStatus;
  if (!status) return null;

  return (
    <div className="card shadow-sm border-0 mb-4" aria-live="polite">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><i className="bi bi-stars text-primary me-2"></i>AI assessment</h5>
        {report.aiSeverity && <StatusBadge value={report.aiSeverity} className="fs-6" />}
      </div>
      <div className="card-body">
        {status === "PENDING" && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
            Analysing the photo...
          </div>
        )}

        {status === "DISABLED" && (
          <p className="text-muted mb-0">AI assessment is not configured on the server.</p>
        )}

        {status === "FAILED" && (
          <p className="text-muted mb-0">
            The AI could not assess this photo (the free AI quota may be used up). A technician will review it.
          </p>
        )}

        {status === "COMPLETED" && (
          <>
            {report.aiSafetyRisk && (
              <div className="alert alert-danger py-2">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Possible safety risk - handle with care.
              </div>
            )}
            <p className="mb-3">{report.aiSummary}</p>
            <div className="row g-3 text-center">
              <div className="col-4">
                <div className="small text-muted">Damage</div>
                <div className="fw-semibold">{formatEnum(report.aiDamageType)}</div>
              </div>
              <div className="col-4">
                <div className="small text-muted">Suggested</div>
                <div className="fw-semibold">{formatEnum(report.aiSuggestedAction)}</div>
              </div>
              <div className="col-4">
                <div className="small text-muted">Est. cost</div>
                <div className="fw-semibold">
                  {formatMoney(report.aiCostMin)} - {formatMoney(report.aiCostMax)}
                </div>
              </div>
            </div>
            <div className="small text-muted mt-3">
              Suggested by AI {formatRelative(report.aiAnalyzedAt)} - a technician makes the final decision.
            </div>
          </>
        )}

        {canRerun && (status === "FAILED" || status === "COMPLETED") && (
          <button className="btn btn-sm btn-outline-primary mt-3" onClick={onRerun} disabled={busy}>
            <i className="bi bi-arrow-repeat me-1"></i> Run AI again
          </button>
        )}
      </div>
    </div>
  );
};

export default AiTriageCard;
