import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import assetApi from "../../services/assetApi";
import assetRequestApi from "../../services/assetRequestApi";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useToast } from "../../components/common/Feedback";
import { fileUrl } from "../../config";
import { getErrorMessage } from "../../utils/apiError";

/**
 * Opened by scanning an asset's QR sticker (/a/LAP-0042). Mobile-first:
 * big buttons for exactly the actions the server says this user may take.
 */
const AssetScan = () => {
  const { assetCode } = useParams();
  const toast = useToast();

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(null); // "request" | "return"
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      setScan(await assetApi.scanByCode(assetCode));
    } catch (err) {
      setError(getErrorMessage(err, "Asset not found."));
    } finally {
      setLoading(false);
    }
  }, [assetCode]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "request") {
        await assetRequestApi.createRequest({ assetId: scan.asset.id, reason: text.trim() });
        toast.success("Request sent to your manager.");
      } else {
        await assetRequestApi.requestAssetReturn(scan.myAssignmentId, text.trim() || null);
        toast.success("Return requested.");
      }
      setMode(null);
      setText("");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "The action failed."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader text="Looking up asset..." />;
  if (error) {
    return (
      <div className="container py-4" style={{ maxWidth: 520 }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/scan" className="btn btn-primary w-100">Scan another code</Link>
      </div>
    );
  }

  const { asset, allowedActions, heldByMe } = scan;
  const can = (a) => allowedActions.includes(a);
  const big = "btn btn-lg w-100 mb-2 text-start d-flex align-items-center gap-3";

  return (
    <div className="container py-3" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body d-flex gap-3 align-items-center">
          {asset.imageUrl ? (
            <img src={fileUrl(asset.imageUrl)} alt={asset.name} className="rounded"
                 style={{ width: 84, height: 84, objectFit: "cover" }} />
          ) : (
            <div className="rounded bg-light d-flex align-items-center justify-content-center"
                 style={{ width: 84, height: 84 }}>
              <i className="bi bi-box-seam fs-2 text-muted" aria-hidden="true"></i>
            </div>
          )}
          <div className="flex-grow-1">
            <h1 className="h5 mb-1">{asset.name}</h1>
            <div className="text-muted small mb-1">{asset.assetCode} · {asset.category?.name}</div>
            <StatusBadge value={asset.status} />
            {heldByMe && <span className="badge bg-info text-dark ms-1">Assigned to you</span>}
            {!heldByMe && asset.currentHolderName && (
              <div className="small text-muted mt-1">Held by {asset.currentHolderName}</div>
            )}
          </div>
        </div>
      </div>

      {mode ? (
        <div className="card shadow-sm border-0 mb-3">
          <div className="card-body">
            <form onSubmit={submit}>
              <label className="form-label fw-semibold" htmlFor="scan-text">
                {mode === "request" ? "Why do you need it?" : "Return note (optional)"}
              </label>
              <textarea id="scan-text" className="form-control mb-2" rows="3" maxLength={mode === "request" ? 1000 : 500}
                        value={text} onChange={(e) => setText(e.target.value)} autoFocus
                        required={mode === "request"} />
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-lg flex-grow-1"
                        disabled={busy || (mode === "request" && !text.trim())}>
                  {mode === "request" ? "Send request" : "Request return"}
                </button>
                <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => setMode(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div>
          {can("REPORT_DAMAGE") && (
            <Link to={`/damage?assetId=${asset.id}`} className={`${big} btn-danger`}>
              <i className="bi bi-camera fs-4"></i> Report damage (take photo)
            </Link>
          )}
          {can("REQUEST_RETURN") && (
            <button className={`${big} btn-warning`} onClick={() => setMode("return")}>
              <i className="bi bi-arrow-return-left fs-4"></i> Request return
            </button>
          )}
          {can("REQUEST_ASSET") && (
            <button className={`${big} btn-primary`} onClick={() => setMode("request")}>
              <i className="bi bi-hand-index fs-4"></i> Request this asset
            </button>
          )}
          {can("UPDATE_DAMAGE") && (
            <Link to="/damage/all" className={`${big} btn-outline-danger`}>
              <i className="bi bi-exclamation-octagon fs-4"></i> Damage reports
            </Link>
          )}
          {can("MANAGE_MAINTENANCE") && (
            <Link to="/maintenance" className={`${big} btn-outline-primary`}>
              <i className="bi bi-tools fs-4"></i> Maintenance jobs
            </Link>
          )}
          {can("RECEIVE_RETURN") && (
            <Link to="/assignments" className={`${big} btn-warning`}>
              <i className="bi bi-box-arrow-in-down fs-4"></i> Receive return
            </Link>
          )}
          {can("AUDIT_SCAN") && (
            <Link to="/audits" className={`${big} btn-outline-secondary`}>
              <i className="bi bi-clipboard-check fs-4"></i> Stock-take
            </Link>
          )}
          <Link to={`/assets/${asset.id}`} className={`${big} btn-outline-secondary`}>
            <i className="bi bi-info-circle fs-4"></i>
            {can("VIEW_HISTORY") ? "Details and history" : "Details"}
          </Link>
          <Link to="/scan" className="btn btn-link w-100">Scan another code</Link>
        </div>
      )}
    </div>
  );
};

export default AssetScan;
