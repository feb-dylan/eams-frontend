import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import assetRequestApi from "../../services/assetRequestApi";
import assetApi from "../../services/assetApi";
import StatusBadge from "../../components/common/StatusBadge";
import DetailRow from "../../components/common/DetailRow";
import PageLoader from "../../components/common/PageLoader";
import { useConfirm, useToast } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatDateTime } from "../../utils/format";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [request, setRequest] = useState(null);
  const [available, setAvailable] = useState([]);
  const [chosenAsset, setChosenAsset] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";

  // Note: loading never clears the success toast (old bug: the message vanished instantly)
  const load = useCallback(async () => {
    try {
      setError("");
      const data = await assetRequestApi.getRequestById(id);
      setRequest(data);
      if (isAdmin && data.status === "APPROVED" && !data.assetId) {
        const assets = await assetApi.filterAssets({ status: "AVAILABLE", categoryId: data.categoryId });
        setAvailable(assets);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load the request."));
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (action, successMessage) => {
    setBusy(true);
    try {
      await action();
      toast.success(successMessage);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "The action failed."));
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    if (!(await confirm({ title: "Approve request", message: "Approve this asset request?",
      confirmText: "Approve", variant: "success" }))) return;
    run(() => assetRequestApi.approveRequest(request.id), "Request approved.");
  };

  const reject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    await run(() => assetRequestApi.rejectRequest(request.id, rejectionReason.trim()), "Request rejected.");
    setShowReject(false);
    setRejectionReason("");
  };

  const assign = async () => {
    if (!request.assetId && !chosenAsset) {
      toast.error("Choose which asset to hand out.");
      return;
    }
    if (!(await confirm({ title: "Assign asset", message: `Assign this asset to ${request.employeeName}?`,
      confirmText: "Assign" }))) return;
    run(() => assetRequestApi.assignAsset(request.id, request.assetId ? null : Number(chosenAsset)),
      "Asset assigned.");
  };

  if (loading) return <PageLoader text="Loading request..." />;

  if (!request) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error || "Request not found."}</div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
      </div>
    );
  }

  const target = request.assetId
    ? <Link to={`/assets/${request.assetId}`}><strong>{request.assetCode}</strong> {request.assetName}</Link>
    : <>Any <strong>{request.categoryName}</strong></>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0">Request #{request.id}</h2>
            <StatusBadge value={request.status} />
          </div>
          <p className="text-muted mb-0">Requested {formatDateTime(request.requestDate)}</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white"><h5 className="mb-0">Request information</h5></div>
            <div className="card-body">
              <DetailRow label="Employee">
                {role === "EMPLOYEE" ? request.employeeName : (
                  <Link to={`/employees/${request.employeeId}`}>{request.employeeName}</Link>
                )}
                {request.employeeCode && <span className="text-muted ms-2">({request.employeeCode})</span>}
              </DetailRow>
              <DetailRow label="Asked for">{target}</DetailRow>
              <DetailRow label="Priority"><StatusBadge value={request.priority} /></DetailRow>
              <DetailRow label="Needed by">{formatDate(request.neededBy)}</DetailRow>
              <DetailRow label="Reason">
                <div className="bg-light rounded p-3">{request.reason}</div>
              </DetailRow>
              {request.assignmentStatus && (
                <DetailRow label="Assignment"><StatusBadge value={request.assignmentStatus} /></DetailRow>
              )}
              {request.approvedAt && (
                <DetailRow label={request.status === "REJECTED" ? "Rejected" : "Approved"}>
                  {formatDateTime(request.approvedAt)}
                  {request.approvedByEmail && <span className="text-muted"> by {request.approvedByEmail}</span>}
                </DetailRow>
              )}
              {request.rejectionReason && (
                <DetailRow label="Rejection reason">
                  <div className="alert alert-danger mb-0 py-2">{request.rejectionReason}</div>
                </DetailRow>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white"><h5 className="mb-0">Actions</h5></div>
            <div className="card-body d-grid gap-2">
              {isManager && request.status === "PENDING" && (
                <>
                  <button className="btn btn-success" onClick={approve} disabled={busy}>
                    <i className="bi bi-check-lg me-1"></i> Approve
                  </button>
                  {!showReject ? (
                    <button className="btn btn-outline-danger" onClick={() => setShowReject(true)} disabled={busy}>
                      <i className="bi bi-x-lg me-1"></i> Reject
                    </button>
                  ) : (
                    <form onSubmit={reject}>
                      <label className="form-label" htmlFor="rejection">Reason</label>
                      <textarea id="rejection" className="form-control mb-2" rows="3" maxLength={500}
                                value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                                autoFocus required />
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-danger flex-grow-1"
                                disabled={busy || !rejectionReason.trim()}>Reject</button>
                        <button type="button" className="btn btn-outline-secondary"
                                onClick={() => setShowReject(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {isAdmin && request.status === "APPROVED" && (
                <>
                  {!request.assetId && (
                    <div>
                      <label className="form-label" htmlFor="choose-asset">Choose a {request.categoryName}</label>
                      <select id="choose-asset" className="form-select" value={chosenAsset}
                              onChange={(e) => setChosenAsset(e.target.value)}>
                        <option value="">-- available assets --</option>
                        {available.map((a) => (
                          <option key={a.id} value={a.id}>{a.assetCode} - {a.name}</option>
                        ))}
                      </select>
                      {available.length === 0 && (
                        <div className="small text-danger mt-1">None in stock right now.</div>
                      )}
                    </div>
                  )}
                  <button className="btn btn-primary" onClick={assign} disabled={busy}>
                    <i className="bi bi-box-arrow-right me-1"></i> Assign asset
                  </button>
                </>
              )}

              {!(isManager && request.status === "PENDING") && !(isAdmin && request.status === "APPROVED") && (
                <p className="text-muted small mb-0">No actions available for this request.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
