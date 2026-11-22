import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import maintenanceApi from "../../services/maintenanceApi";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatMoney } from "../../utils/format";

const COLUMNS = [
  { status: "SCHEDULED", title: "Scheduled" },
  { status: "IN_PROGRESS", title: "In progress" },
  { status: "COMPLETED", title: "Done" },
];

/** Technician's own job board. */
const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    maintenanceApi.getMyMaintenance()
      .then(setJobs)
      .catch((err) => setError(getErrorMessage(err, "Failed to load your jobs.")))
      .finally(() => setLoading(false));
  }, []);

  const byStatus = useMemo(() => {
    const groups = {};
    COLUMNS.forEach((c) => {
      groups[c.status] = jobs.filter((j) => j.status === c.status);
    });
    return groups;
  }, [jobs]);

  if (loading) return <PageLoader text="Loading your jobs..." />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">My Jobs</h2>
          <p className="text-muted mb-0">Maintenance jobs assigned to you</p>
        </div>
        <Link to="/damage/all" className="btn btn-outline-primary">
          <i className="bi bi-exclamation-octagon me-1"></i> Damage queue
        </Link>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="row g-3">
        {COLUMNS.map((col) => (
          <div className="col-md-4" key={col.status}>
            <div className="bg-light rounded-3 p-3 h-100">
              <div className="d-flex justify-content-between mb-3">
                <h5 className="mb-0">{col.title}</h5>
                <span className="badge bg-secondary">{byStatus[col.status].length}</span>
              </div>
              {byStatus[col.status].length === 0 && <p className="text-muted small mb-0">Nothing here.</p>}
              {byStatus[col.status].map((j) => (
                <Link key={j.id} to={`/maintenance/${j.id}`} className="card border-0 shadow-sm mb-2 text-decoration-none text-body">
                  <div className="card-body py-2">
                    <div className="d-flex justify-content-between">
                      <strong>{j.assetCode}</strong>
                      <StatusBadge value={j.status} />
                    </div>
                    <div className="small">{j.assetName}</div>
                    <div className="small text-muted text-truncate">{j.description}</div>
                    <div className="small text-muted">
                      Started {formatDate(j.startDate)}
                      {j.repairCost != null && ` · ${formatMoney(j.repairCost)}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyJobs;
