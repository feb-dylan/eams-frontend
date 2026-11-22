import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import damageApi from "../../services/damageApi";
import assetRequestApi from "../../services/assetRequestApi";
import PhotoPicker from "../../components/damages/PhotoPicker";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useToast } from "../../components/common/Feedback";
import { getErrorMessage } from "../../utils/apiError";
import { formatDateTime } from "../../utils/format";

const MyDamageReports = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetId, setAssetId] = useState(params.get("assetId") || "");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [mine, held] = await Promise.all([
        damageApi.getMyDamageReports(),
        assetRequestApi.getMyAssignedAssets(),
      ]);
      setReports(mine);
      setAssets(held.map((a) => ({ id: a.assetId, assetCode: a.assetCode, name: a.assetName })));
    } catch (err) {
      setError(err?.response?.status === 404
        ? "Please complete your employee profile on the dashboard first."
        : getErrorMessage(err, "Failed to load your damage reports."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!assetId) return toast.error("Please select the damaged asset.");
    if (!description.trim()) return toast.error("Please describe the damage.");

    setSubmitting(true);
    try {
      const report = await damageApi.createDamageReport({
        assetId: Number(assetId),
        description: description.trim(),
      });
      if (photos.length > 0) {
        setProgress(0);
        await damageApi.uploadPhotos(report.id, photos, setProgress);
      }
      toast.success(photos.length ? "Damage reported. The AI assessment is running." : "Damage reported.");
      navigate(`/damage/${report.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit the damage report."));
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  };

  if (loading) return <PageLoader text="Loading..." />;

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1">Report Damage</h2>
        <p className="text-muted mb-0">Report damage to an asset assigned to you</p>
      </div>

      {error && <div className="alert alert-warning" role="alert">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">New damage report</h5></div>
            <div className="card-body">
              {assets.length === 0 ? (
                <p className="text-muted mb-0">You have no assigned assets to report.</p>
              ) : (
                <form onSubmit={submit} noValidate>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="damage-asset">Asset</label>
                    <select id="damage-asset" className="form-select" value={assetId}
                            onChange={(e) => setAssetId(e.target.value)} disabled={submitting}>
                      <option value="">-- Select asset --</option>
                      {assets.map((a) => (
                        <option key={a.id} value={a.id}>{a.assetCode} - {a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="damage-description">What happened?</label>
                    <textarea id="damage-description" className="form-control" rows="4" maxLength={2000}
                              value={description} onChange={(e) => setDescription(e.target.value)}
                              disabled={submitting} placeholder="e.g. Dropped the laptop, the screen is cracked" />
                    <div className="form-text">{description.length}/2000</div>
                  </div>
                  <div className="mb-3">
                    <PhotoPicker files={photos} onChange={setPhotos} disabled={submitting} />
                  </div>

                  {progress !== null && (
                    <div className="progress mb-3" role="progressbar" aria-label="Upload progress"
                         aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                      <div className="progress-bar" style={{ width: `${progress}%` }}>{progress}%</div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-danger w-100" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit damage report"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between">
              <h5 className="mb-0">My reports</h5>
              <span className="badge bg-secondary">{reports.length}</span>
            </div>
            {reports.length === 0 ? (
              <div className="card-body text-center text-muted py-5">No damage reported yet.</div>
            ) : (
              <ul className="list-group list-group-flush">
                {reports.map((r) => (
                  <li key={r.id} className="list-group-item">
                    <Link to={`/damage/${r.id}`} className="text-decoration-none text-body d-flex gap-3">
                      {r.photoUrls?.length > 0 && <i className="bi bi-image text-muted fs-4" aria-hidden="true"></i>}
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <strong>{r.assetCode} - {r.assetName}</strong>
                          <StatusBadge value={r.status} />
                        </div>
                        <div className="small text-muted text-truncate">{r.description}</div>
                        <div className="small text-muted">
                          {formatDateTime(r.reportedDate)}
                          {r.aiSeverity && <> · AI: <StatusBadge value={r.aiSeverity} /></>}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDamageReports;
