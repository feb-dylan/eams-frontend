import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import assetRequestApi from "../../services/assetRequestApi";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useConfirm, useToast } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatRelative } from "../../utils/format";

const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };

const PendingRequests = () => {
  const { role } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const canDecide = role === "MANAGER";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await assetRequestApi.getPendingRequests();
      // most urgent first, then oldest first
      data.sort((a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
        || new Date(a.requestDate) - new Date(b.requestDate));
      setRequests(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load pending requests."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (r) => {
    const what = r.assetName ? `${r.assetCode} ${r.assetName}` : `a ${r.categoryName}`;
    if (!(await confirm({ title: "Approve request", message: `Approve ${r.employeeName}'s request for ${what}?`,
      confirmText: "Approve", variant: "success" }))) return;
    setBusyId(r.id);
    try {
      await assetRequestApi.approveRequest(r.id);
      toast.success("Request approved.");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve request."));
    } finally {
      setBusyId(null);
    }
  };

  const submitReject = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setBusyId(rejecting.id);
    try {
      await assetRequestApi.rejectRequest(rejecting.id, reason.trim());
      toast.success("Request rejected.");
      setRejecting(null);
      setReason("");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject request."));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageLoader text="Loading pending requests..." />;

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1">Pending Requests</h2>
        <p className="text-muted mb-0">Most urgent first</p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {rejecting && (
        <div className="card border-danger shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={submitReject}>
              <label className="form-label fw-semibold" htmlFor="reject-reason">
                Reason for rejecting {rejecting.employeeName}&apos;s request
              </label>
              <textarea id="reject-reason" className="form-control mb-2" rows="3" maxLength={500}
                        value={reason} onChange={(e) => setReason(e.target.value)} autoFocus required />
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-danger" disabled={!reason.trim() || busyId}>
                  Reject request
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setRejecting(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        {requests.length === 0 ? (
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-check2-all fs-1 d-block mb-2"></i>
            No pending requests. Nice work!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Asked for</th>
                  <th>Reason</th>
                  <th>Priority</th>
                  <th>Needed by</th>
                  <th>Requested</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-semibold">{r.employeeName}</div>
                      <div className="small text-muted">{r.employeeCode}</div>
                    </td>
                    <td>
                      {r.assetId ? <><strong>{r.assetCode}</strong> {r.assetName}</> : <>Any {r.categoryName}</>}
                    </td>
                    <td className="small" style={{ maxWidth: 280 }}>{r.reason}</td>
                    <td><StatusBadge value={r.priority} /></td>
                    <td>{formatDate(r.neededBy)}</td>
                    <td className="small text-muted">{formatRelative(r.requestDate)}</td>
                    <td className="text-end text-nowrap">
                      <Link to={`/requests/${r.id}`} className="btn btn-sm btn-outline-secondary me-1"
                            aria-label="View details"><i className="bi bi-eye"></i></Link>
                      {canDecide && (
                        <>
                          <button className="btn btn-sm btn-success me-1" disabled={busyId === r.id}
                                  onClick={() => approve(r)} aria-label="Approve">
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" disabled={busyId === r.id}
                                  onClick={() => { setRejecting(r); setReason(""); }} aria-label="Reject">
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRequests;
