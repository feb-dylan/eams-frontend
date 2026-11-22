import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auditApi } from "../../services/featureApi";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useToast } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/format";

/** Stock-take campaigns: walk around, scan every asset, find what is missing. */
const AuditList = () => {
  const { role } = useAuth();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setCampaigns(await auditApi.list());
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load audits."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await auditApi.create(name.trim(), location.trim() || null);
      toast.success("Audit started.");
      setName("");
      setLocation("");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to start the audit."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader text="Loading audits..." />;

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1">Stock-take</h2>
        <p className="text-muted mb-0">Check that every asset is where the system says it is</p>
      </div>

      {role === "ADMIN" && (
        <form className="card card-body border-0 shadow-sm mb-4" onSubmit={create}>
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label" htmlFor="audit-name">Audit name</label>
              <input id="audit-name" className="form-control" maxLength={150} value={name}
                     onChange={(e) => setName(e.target.value)} placeholder="Q4 audit - HQ Floor 3" required />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="audit-location">Location (optional)</label>
              <input id="audit-location" className="form-control" maxLength={255} value={location}
                     onChange={(e) => setLocation(e.target.value)} placeholder="HQ Floor 3" />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100" disabled={busy || !name.trim()}>
                <i className="bi bi-play-fill me-1"></i> Start audit
              </button>
            </div>
          </div>
          <div className="form-text">With a location, only assets whose location starts with it are expected.</div>
        </form>
      )}

      <div className="row g-3">
        {campaigns.length === 0 && <p className="text-muted">No audits yet.</p>}
        {campaigns.map((c) => {
          const percent = c.expected ? Math.round((c.scanned / c.expected) * 100) : 0;
          return (
            <div className="col-md-6 col-xl-4" key={c.id}>
              <Link to={`/audits/${c.id}`} className="card border-0 shadow-sm h-100 text-decoration-none text-body">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-1">{c.name}</h5>
                    <StatusBadge value={c.status} />
                  </div>
                  <div className="small text-muted mb-2">
                    {c.location || "All locations"} · started {formatDate(c.createdAt)}
                  </div>
                  <div className="progress" role="progressbar" aria-label="Scanned"
                       aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100">
                    <div className="progress-bar" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="small mt-1">{c.scanned} of {c.expected} scanned</div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditList;
