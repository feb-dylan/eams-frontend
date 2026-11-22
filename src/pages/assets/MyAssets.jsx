import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import assetRequestApi from "../../services/assetRequestApi";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useToast } from "../../components/common/Feedback";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/format";

const MyAssets = () => {
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returning, setReturning] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // Always finishes loading - previously the spinner never stopped when the
  // employee id was not known yet.
  const load = useCallback(async () => {
    try {
      setError("");
      setAssignments(await assetRequestApi.getMyAssignedAssets());
    } catch (err) {
      setError(err?.response?.status === 404
        ? "Please complete your employee profile on the dashboard first."
        : getErrorMessage(err, "Failed to load your assets."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitReturn = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await assetRequestApi.requestAssetReturn(returning.id, note.trim() || null);
      toast.success("Return requested. An administrator will collect the asset.");
      setReturning(null);
      setNote("");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to request the return."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader text="Loading your assets..." />;

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1">My Assets</h2>
        <p className="text-muted mb-0">Everything currently assigned to you</p>
      </div>

      {error && <div className="alert alert-warning" role="alert">{error}</div>}

      {!error && assignments.length === 0 && (
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-pc-display fs-1 d-block mb-2"></i>
            No assets assigned to you yet. <Link to="/requests">Request one</Link>.
          </div>
        </div>
      )}

      <div className="row g-3">
        {assignments.map((a) => (
          <div className="col-md-6 col-xl-4" key={a.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="mb-0">{a.assetName}</h5>
                    <div className="text-muted small">{a.assetCode}</div>
                  </div>
                  <StatusBadge value={a.status} />
                </div>
                <div className="small text-muted mb-3">Assigned {formatDate(a.assignedDate)}</div>

                {returning?.id === a.id ? (
                  <form onSubmit={submitReturn}>
                    <label className="form-label small" htmlFor={`note-${a.id}`}>Return note (optional)</label>
                    <textarea id={`note-${a.id}`} className="form-control form-control-sm mb-2" rows="2"
                              maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-sm btn-warning" disabled={busy}>Request return</button>
                      <button type="button" className="btn btn-sm btn-outline-secondary"
                              onClick={() => setReturning(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    <Link to={`/assets/${a.assetId}`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye me-1"></i> Details
                    </Link>
                    <Link to={`/damage?assetId=${a.assetId}`} className="btn btn-sm btn-outline-danger">
                      <i className="bi bi-exclamation-octagon me-1"></i> Report damage
                    </Link>
                    {a.status === "ACTIVE" && (
                      <button className="btn btn-sm btn-outline-warning" onClick={() => { setReturning(a); setNote(""); }}>
                        <i className="bi bi-arrow-return-left me-1"></i> Return
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAssets;
