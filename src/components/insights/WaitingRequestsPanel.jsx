import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { insightsApi } from "../../services/featureApi";
import StatusBadge from "../common/StatusBadge";
import { useToast } from "../common/Feedback";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/format";

/**
 * Opens under an idle asset on the Insights page: the requests waiting for its category.
 * Flow: employee requests -> MANAGER approves -> ADMIN assigns.
 *  - Manager: "Review" opens a pending request to approve or reject it.
 *  - Admin: "Assign" for approved requests; "Remind manager" when requests still wait for approval.
 */
const WaitingRequestsPanel = ({ assetId, role }) => {
  const toast = useToast();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    insightsApi
      .waitingRequests(assetId)
      .then(setRequests)
      .catch((err) => setError(getErrorMessage(err, "Failed to load the waiting requests.")));
  }, [assetId]);

  const remindManagers = async () => {
    try {
      setSending(true);
      await insightsApi.remindManagers(assetId, note.trim() || null);
      setSent(true);
      toast.success("Reminder sent to the managers.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send the reminder."));
    } finally {
      setSending(false);
    }
  };

  if (error) return <div className="alert alert-danger small mb-0 mt-2">{error}</div>;
  if (!requests) return <div className="small text-muted mt-2">Loading requests...</div>;
  if (requests.length === 0) return <div className="small text-muted mt-2">No requests are waiting any more.</div>;

  const hasPending = requests.some((r) => r.status === "PENDING");

  return (
    <div className="mt-2 p-2 rounded bg-light">
      <ul className="list-unstyled small mb-2">
        {requests.map((r) => (
          <li key={r.id} className="d-flex flex-wrap gap-2 align-items-center py-1 border-bottom">
            <span className="fw-semibold">{r.employeeName || "Employee"}</span>
            <StatusBadge value={r.status} />
            <StatusBadge value={r.priority} />
            {r.neededBy && <span className="text-muted">needed by {formatDate(r.neededBy)}</span>}
            {r.reason && <span className="text-muted text-truncate" style={{ maxWidth: "18rem" }}>"{r.reason}"</span>}
            <span className="ms-auto">
              <RequestAction request={r} role={role} />
            </span>
          </li>
        ))}
      </ul>

      {role === "MANAGER" && hasPending && (
        <div className="small text-muted">
          Approve one of these, and the admin can assign this idle asset instead of buying a new one.
        </div>
      )}

      {role === "ADMIN" && hasPending && (
        sent ? (
          <div className="small text-success"><i className="bi bi-check2-circle me-1"></i>Managers have been reminded.</div>
        ) : (
          <div className="d-flex flex-column flex-sm-row gap-2">
            <input
              className="form-control form-control-sm"
              placeholder="Note for the manager (optional)"
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button className="btn btn-sm btn-success text-nowrap" onClick={remindManagers} disabled={sending}>
              <i className="bi bi-bell me-1"></i>{sending ? "Sending..." : "Remind manager"}
            </button>
          </div>
        )
      )}
    </div>
  );
};

/** What the current user can do with one waiting request. */
const RequestAction = ({ request, role }) => {
  if (request.status === "PENDING") {
    return role === "MANAGER" ? (
      <Link to={`/requests/${request.id}`} className="btn btn-sm btn-primary py-0">
        Review: approve / reject
      </Link>
    ) : (
      <span className="text-muted">waiting for manager approval</span>
    );
  }
  // APPROVED: the admin assigns it
  return role === "ADMIN" ? (
    <Link to="/requests/approved" className="btn btn-sm btn-success py-0">Assign</Link>
  ) : (
    <span className="text-muted">approved, admin will assign</span>
  );
};

export default WaitingRequestsPanel;
