import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import damageApi from "../../services/damageApi";
import AiTriageCard from "../../components/ai/AiTriageCard";
import PhotoPicker from "../../components/damages/PhotoPicker";
import StatusBadge from "../../components/common/StatusBadge";
import DetailRow from "../../components/common/DetailRow";
import PageLoader from "../../components/common/PageLoader";
import { useToast } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { fileUrl } from "../../config";
import { getErrorMessage } from "../../utils/apiError";
import { formatDateTime, formatEnum } from "../../utils/format";

/** Allowed next statuses (same rules as the server). */
const NEXT = {
  REPORTED: ["UNDER_REVIEW", "REPAIRING", "RESOLVED"],
  UNDER_REVIEW: ["REPORTED", "REPAIRING", "RESOLVED"],
  REPAIRING: ["UNDER_REVIEW", "RESOLVED"],
  RESOLVED: [],
};

const DamageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const toast = useToast();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [newPhotos, setNewPhotos] = useState([]);
  const [zoom, setZoom] = useState(null);

  const canManage = role === "TECHNICIAN" || role === "ADMIN";
  const isEmployee = role === "EMPLOYEE";

  const load = useCallback(async () => {
    try {
      const data = await damageApi.getDamageReportById(id);
      setReport(data);
      setStatus(data.status);
      setNote(data.resolutionNote || "");
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load the damage report."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // While the AI is working, check again every 3 seconds (max ~2 minutes).
  useEffect(() => {
    if (report?.aiStatus !== "PENDING") return undefined;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const fresh = await damageApi.getDamageReportById(id);
        if (fresh.aiStatus !== "PENDING" || tries > 40) {
          setReport(fresh);
          clearInterval(timer);
        }
      } catch {
        clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [report?.aiStatus, id]);

  const update = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await damageApi.updateDamageReport(id, { status, resolutionNote: note.trim() || null });
      setReport(updated);
      toast.success("Damage report updated.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update the damage report."));
    } finally {
      setBusy(false);
    }
  };

  const uploadPhotos = async () => {
    setBusy(true);
    try {
      setReport(await damageApi.uploadPhotos(id, newPhotos));
      setNewPhotos([]);
      toast.success("Photos added.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload photos."));
    } finally {
      setBusy(false);
    }
  };

  const rerunAi = async () => {
    setBusy(true);
    try {
      setReport(await damageApi.runAiTriage(id));
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not start the AI assessment."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader text="Loading damage report..." />;
  if (!report) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error || "Damage report not found."}</div>
      </div>
    );
  }

  const photos = report.photoUrls || [];
  const options = [report.status, ...(NEXT[report.status] || [])];

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0">Damage #{report.id}</h2>
            <StatusBadge value={report.status} />
          </div>
          <p className="text-muted mb-0">Reported {formatDateTime(report.reportedDate)}</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <AiTriageCard report={report} canRerun={canManage && photos.length > 0} onRerun={rerunAi} busy={busy} />

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white"><h5 className="mb-0">Details</h5></div>
            <div className="card-body">
              <DetailRow label="Asset">
                <Link to={`/assets/${report.assetId}`}><strong>{report.assetCode}</strong> {report.assetName}</Link>
              </DetailRow>
              <DetailRow label="Reported by">
                {report.employeeName} <span className="text-muted">({report.employeeCode})</span>
              </DetailRow>
              <DetailRow label="Description">
                <div className="bg-light rounded p-3">{report.description}</div>
              </DetailRow>
              {report.resolutionNote && <DetailRow label="Resolution">{report.resolutionNote}</DetailRow>}
              <DetailRow label="Last update">{formatDateTime(report.updatedAt)}</DetailRow>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white"><h5 className="mb-0">Photos</h5></div>
            <div className="card-body">
              {photos.length === 0 && <p className="text-muted">No photos uploaded.</p>}
              <div className="d-flex flex-wrap gap-2">
                {photos.map((url, i) => (
                  <button key={url} type="button" className="btn p-0 border-0" onClick={() => setZoom(url)}
                          aria-label={`Open photo ${i + 1}`}>
                    <img src={fileUrl(url)} alt={`Damage photo ${i + 1}`} className="rounded border"
                         style={{ width: 140, height: 140, objectFit: "cover" }} />
                  </button>
                ))}
              </div>

              {(isEmployee || canManage) && photos.length < 5 && report.status !== "RESOLVED" && (
                <div className="mt-3">
                  <PhotoPicker files={newPhotos} onChange={setNewPhotos} disabled={busy} />
                  {newPhotos.length > 0 && (
                    <button className="btn btn-primary btn-sm mt-2" onClick={uploadPhotos} disabled={busy}>
                      Upload {newPhotos.length} photo(s)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          {canManage && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white"><h5 className="mb-0">Update status</h5></div>
              <div className="card-body">
                {report.status === "RESOLVED" ? (
                  <p className="text-muted mb-0">This report is resolved.</p>
                ) : (
                  <form onSubmit={update}>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="damage-status">Status</label>
                      <select id="damage-status" className="form-select" value={status}
                              onChange={(e) => setStatus(e.target.value)} disabled={busy}>
                        {options.map((s) => <option key={s} value={s}>{formatEnum(s)}</option>)}
                      </select>
                      <div className="form-text">
                        Set to <strong>Repairing</strong>, then create a maintenance job for the repair.
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="damage-note">Resolution note</label>
                      <textarea id="damage-note" className="form-control" rows="3" maxLength={1000}
                                value={note} onChange={(e) => setNote(e.target.value)} disabled={busy} />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={busy}>Save</button>
                  </form>
                )}
                {report.status === "REPAIRING" && (
                  <Link to="/maintenance" className="btn btn-outline-primary w-100 mt-2">
                    <i className="bi bi-tools me-1"></i> Go to maintenance
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {zoom && (
        <>
          <div className="modal d-block" role="dialog" aria-modal="true" onClick={() => setZoom(null)}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content bg-transparent border-0">
                <img src={fileUrl(zoom)} alt="Damage photo enlarged" className="img-fluid rounded" />
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
};

export default DamageDetails;
