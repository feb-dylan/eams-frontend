import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import assetRequestApi from "../../services/assetRequestApi";
import assetApi from "../../services/assetApi";
import categoryApi from "../../services/categoryApi";
import RequestForm from "../../components/requests/RequestForm";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useToast } from "../../components/common/Feedback";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatDateTime } from "../../utils/format";

const MyRequests = () => {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [mine, assets, cats] = await Promise.all([
        assetRequestApi.getMyRequests(),
        assetApi.getAssetsByStatus("AVAILABLE"),
        categoryApi.getCategories(),
      ]);
      setRequests(mine);
      setAvailableAssets(assets);
      setCategories(cats);
      setProfileMissing(false);
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfileMissing(true);
      } else {
        setError(getErrorMessage(err, "Failed to load your requests."));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await assetRequestApi.createRequest(data);
      toast.success("Request submitted. A manager will review it.");
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader text="Loading your requests..." />;

  if (profileMissing) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Please complete your employee profile on the <Link to="/dashboard">dashboard</Link> before
          requesting assets.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">My Requests</h2>
          <p className="text-muted mb-0">Request assets and follow their approval</p>
        </div>
        {!showForm && (
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-lg me-1"></i> New Request
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header"><h5 className="mb-0">New asset request</h5></div>
          <div className="card-body">
            <RequestForm assets={availableAssets} categories={categories}
                         onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Request history</h5>
          <span className="badge bg-secondary">{requests.length}</span>
        </div>
        {requests.length === 0 ? (
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
            You have not requested any assets yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Asset / category</th>
                  <th>Requested</th>
                  <th>Priority</th>
                  <th>Needed by</th>
                  <th>Status</th>
                  <th><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.assetId ? (
                        <><strong>{r.assetCode}</strong> {r.assetName}</>
                      ) : (
                        <>Any <strong>{r.categoryName}</strong></>
                      )}
                    </td>
                    <td>{formatDateTime(r.requestDate)}</td>
                    <td><StatusBadge value={r.priority} /></td>
                    <td>{formatDate(r.neededBy)}</td>
                    <td>
                      <StatusBadge value={r.status} />
                      {r.status === "REJECTED" && r.rejectionReason && (
                        <div className="small text-muted mt-1">{r.rejectionReason}</div>
                      )}
                    </td>
                    <td className="text-end">
                      <Link to={`/requests/${r.id}`} className="btn btn-sm btn-outline-primary"
                            aria-label={`View request ${r.id}`}>
                        <i className="bi bi-eye"></i>
                      </Link>
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

export default MyRequests;
