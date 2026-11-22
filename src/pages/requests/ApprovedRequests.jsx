import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import assetRequestApi from "../../services/assetRequestApi";
import assetApi from "../../services/assetApi";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useConfirm, useToast } from "../../components/common/Feedback";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatRelative } from "../../utils/format";

/** Admin: approved requests waiting for an asset to be handed out. */
const ApprovedRequests = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [requests, setRequests] = useState([]);
  const [available, setAvailable] = useState([]);
  const [choice, setChoice] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const [approved, assets] = await Promise.all([
        assetRequestApi.getApprovedRequests(),
        assetApi.getAssetsByStatus("AVAILABLE"),
      ]);
      setRequests(approved);
      setAvailable(assets);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load approved requests."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const assign = async (r) => {
    const assetId = r.assetId ? null : Number(choice[r.id]);
    if (!r.assetId && !assetId) {
      toast.error("Choose which asset to hand out.");
      return;
    }
    const asset = r.assetId ? `${r.assetCode} ${r.assetName}` : available.find((a) => a.id === assetId)?.name;
    if (!(await confirm({ title: "Assign asset", message: `Assign ${asset} to ${r.employeeName}?`,
      confirmText: "Assign" }))) return;

    setBusyId(r.id);
    try {
      await assetRequestApi.assignAsset(r.id, assetId);
      toast.success(`Assigned to ${r.employeeName}.`);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to assign asset."));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageLoader text="Loading approved requests..." />;

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1">Approved Requests</h2>
        <p className="text-muted mb-0">Hand out the asset to complete each request</p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="card shadow-sm">
        {requests.length === 0 ? (
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-check2-circle fs-1 d-block mb-2"></i>
            Nothing waiting for assignment.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Needed by</th>
                  <th>Approved</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const options = available.filter((a) => a.category?.id === r.categoryId);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="fw-semibold">{r.employeeName}</div>
                        <Link to={`/requests/${r.id}`} className="small">Request #{r.id}</Link>
                      </td>
                      <td style={{ minWidth: 240 }}>
                        {r.assetId ? (
                          <><strong>{r.assetCode}</strong> {r.assetName}</>
                        ) : (
                          <>
                            <label className="form-label small mb-1" htmlFor={`pick-${r.id}`}>
                              Any {r.categoryName}: choose one
                            </label>
                            <select id={`pick-${r.id}`} className="form-select form-select-sm"
                                    value={choice[r.id] || ""}
                                    onChange={(e) => setChoice((c) => ({ ...c, [r.id]: e.target.value }))}>
                              <option value="">-- select asset --</option>
                              {options.map((a) => (
                                <option key={a.id} value={a.id}>{a.assetCode} - {a.name}</option>
                              ))}
                            </select>
                            {options.length === 0 && (
                              <div className="small text-danger mt-1">No available {r.categoryName} in stock</div>
                            )}
                          </>
                        )}
                      </td>
                      <td><StatusBadge value={r.priority} /></td>
                      <td>{formatDate(r.neededBy)}</td>
                      <td className="small text-muted">
                        {formatRelative(r.approvedAt)}
                        {r.approvedByEmail && <div>by {r.approvedByEmail}</div>}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-primary" disabled={busyId === r.id}
                                onClick={() => assign(r)}>
                          <i className="bi bi-box-arrow-right me-1"></i> Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedRequests;
