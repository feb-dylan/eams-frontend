import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { auditApi } from "../../services/featureApi";
import PageLoader from "../../components/common/PageLoader";
import { getErrorMessage } from "../../utils/apiError";
import { formatDateTime, formatEnum } from "../../utils/format";

/** Admin: who did what, when. */
const AuditLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    auditApi.log(300)
      .then(setEntries)
      .catch((err) => setError(getErrorMessage(err, "Failed to load the audit log.")))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.action, e.entityType, e.details, e.actor].some((v) => v && v.toLowerCase().includes(q)));
  }, [entries, filter]);

  if (loading) return <PageLoader text="Loading audit log..." />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">Audit Log</h2>
          <p className="text-muted mb-0">Latest {entries.length} actions in the system</p>
        </div>
        <div>
          <label className="visually-hidden" htmlFor="log-filter">Filter</label>
          <input id="log-filter" className="form-control" placeholder="Filter by action, user, text..."
                 value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead className="table-light">
              <tr><th>When</th><th>Who</th><th>What</th><th>Record</th><th>Details</th></tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id}>
                  <td className="small text-nowrap">{formatDateTime(e.at)}</td>
                  <td className="small">{e.actor || <span className="text-muted">system</span>}</td>
                  <td><span className="badge bg-light text-dark border">{formatEnum(e.action)}</span></td>
                  <td className="small">
                    {e.assetId ? <Link to={`/assets/${e.assetId}`}>Asset #{e.assetId}</Link>
                      : `${formatEnum(e.entityType)} #${e.entityId ?? "-"}`}
                  </td>
                  <td className="small text-muted">{e.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
