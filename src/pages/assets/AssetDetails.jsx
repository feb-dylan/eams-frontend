import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import assetApi from "../../services/assetApi";
import HealthGauge from "../../components/assets/HealthGauge";
import AssetTimeline from "../../components/assets/AssetTimeline";
import StatusBadge from "../../components/common/StatusBadge";
import DetailRow from "../../components/common/DetailRow";
import PageLoader from "../../components/common/PageLoader";
import { useConfirm, useToast } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { fileUrl } from "../../config";
import { getErrorMessage } from "../../utils/apiError";
import { daysUntil, formatDate, formatDateTime, formatEnum, formatMoney } from "../../utils/format";

const DISPOSAL = ["DONATE", "RECYCLE", "RESELL", "DISPOSE"];

/** Opens a print window for one QR label. Built with DOM nodes, so asset text is never parsed as HTML. */
function printLabel(qrUrl, asset) {
  const win = window.open("", "_blank", "width=420,height=560");
  if (!win) return false;
  const doc = win.document;
  doc.title = `${asset.assetCode} - QR label`;
  const style = doc.createElement("style");
  style.textContent = "body{font-family:Arial,sans-serif;text-align:center;padding:24px}"
    + ".code{font-size:22px;font-weight:bold;margin-top:8px}.name{font-size:14px;color:#333}"
    + "img{width:260px;height:260px}";
  doc.head.appendChild(style);
  const img = doc.createElement("img");
  img.src = qrUrl;
  img.alt = "QR code";
  const code = doc.createElement("div");
  code.className = "code";
  code.textContent = asset.assetCode;
  const name = doc.createElement("div");
  name.className = "name";
  name.textContent = asset.name;
  doc.body.append(img, code, name);
  img.onload = () => {
    win.focus();
    win.print();
  };
  return true;
}

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = role === "ADMIN";
  const isStaff = role === "ADMIN" || role === "MANAGER" || role === "TECHNICIAN";

  const [asset, setAsset] = useState(null);
  const [health, setHealth] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [retiring, setRetiring] = useState(false);
  const [disposal, setDisposal] = useState("RECYCLE");
  const [retireNote, setRetireNote] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await assetApi.getAssetById(id);
      setAsset(data);
      // health for everyone, timeline only for staff (it shows who held the asset)
      const [h, t] = await Promise.all([
        assetApi.getHealth(id).catch(() => null),
        isStaff ? assetApi.getTimeline(id).catch(() => null) : Promise.resolve(null),
      ]);
      setHealth(h);
      setTimeline(t);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load the asset."));
    } finally {
      setLoading(false);
    }
  }, [id, isStaff]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => () => qrUrl && URL.revokeObjectURL(qrUrl), [qrUrl]);

  const showQr = async () => {
    try {
      const blob = await assetApi.getAssetQrCode(id);
      setQrUrl(URL.createObjectURL(blob));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to generate the QR code."));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    setBusy(true);
    try {
      const imageUrl = await assetApi.uploadAssetImage(id, imageFile);
      setAsset((a) => ({ ...a, imageUrl }));
      setImageFile(null);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload the image."));
    } finally {
      setBusy(false);
    }
  };

  const retire = async (e) => {
    e.preventDefault();
    if (!(await confirm({ title: "Retire asset", message: `Retire ${asset.assetCode}? Open requests for it will be closed.`,
      confirmText: "Retire", variant: "danger" }))) return;
    setBusy(true);
    try {
      await assetApi.retireAsset(id, disposal, retireNote.trim() || null);
      toast.success("Asset retired.");
      setRetiring(false);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to retire the asset."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader text="Loading asset..." />;
  if (!asset) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error || "Asset not found."}</div>
        <Link to="/assets" className="btn btn-outline-secondary">Back to assets</Link>
      </div>
    );
  }

  const warrantyDays = daysUntil(asset.warrantyExpiryDate);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0">{asset.name}</h2>
            <StatusBadge value={asset.status} />
          </div>
          <p className="text-muted mb-0">{asset.assetCode}</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white"><h5 className="mb-0">Asset information</h5></div>
            <div className="card-body">
              <DetailRow label="Category">{asset.category?.name}</DetailRow>
              <DetailRow label="Serial number">{asset.serialNumber}</DetailRow>
              <DetailRow label="Location">{asset.location}</DetailRow>
              <DetailRow label="Currently held by">{asset.currentHolderName || "Nobody"}</DetailRow>
              <DetailRow label="Purchased">
                {formatDate(asset.purchaseDate)} · {formatMoney(asset.purchasePrice)}
                {asset.vendor && <span className="text-muted"> from {asset.vendor}</span>}
              </DetailRow>
              <DetailRow label="Warranty">
                {asset.warrantyExpiryDate ? (
                  <>
                    {formatDate(asset.warrantyExpiryDate)}
                    {warrantyDays !== null && warrantyDays < 0 && <span className="badge bg-secondary ms-2">expired</span>}
                    {warrantyDays !== null && warrantyDays >= 0 && warrantyDays <= 30 && (
                      <span className="badge bg-warning text-dark ms-2">ends in {warrantyDays} days</span>
                    )}
                  </>
                ) : "None"}
              </DetailRow>
              {asset.description && <DetailRow label="Description">{asset.description}</DetailRow>}
              {asset.status === "RETIRED" && (
                <DetailRow label="Retired">
                  {formatDateTime(asset.retiredAt)}
                  {asset.disposalMethod && ` · ${formatEnum(asset.disposalMethod)}`}
                </DetailRow>
              )}
            </div>
          </div>

          <HealthGauge health={health} />

          {isStaff && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white"><h5 className="mb-0">History</h5></div>
              <div className="card-body"><AssetTimeline events={timeline} /></div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white"><h5 className="mb-0">Image</h5></div>
            <div className="card-body text-center">
              {asset.imageUrl ? (
                <img src={fileUrl(asset.imageUrl)} alt={asset.name} className="img-fluid rounded mb-3"
                     style={{ maxHeight: 260, objectFit: "contain" }} />
              ) : (
                <div className="bg-light rounded py-5 mb-3 text-muted">
                  <i className="bi bi-image fs-1 d-block"></i>No image
                </div>
              )}
              {isAdmin && (
                <>
                  <label className="visually-hidden" htmlFor="asset-image">Choose image</label>
                  <input id="asset-image" type="file" accept="image/jpeg,image/png,image/webp"
                         className="form-control mb-2" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                  <button className="btn btn-primary w-100" onClick={uploadImage} disabled={!imageFile || busy}>
                    Upload image
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white"><h5 className="mb-0">QR label</h5></div>
            <div className="card-body text-center">
              {qrUrl ? (
                <>
                  <img src={qrUrl} alt={`QR code for ${asset.assetCode}`} className="img-fluid mb-2" style={{ maxWidth: 200 }} />
                  <p className="small text-muted">Scan with any phone camera to open this asset.</p>
                  <button className="btn btn-outline-primary w-100"
                          onClick={() => printLabel(qrUrl, asset) || toast.error("Allow pop-ups to print.")}>
                    <i className="bi bi-printer me-1"></i> Print label
                  </button>
                </>
              ) : (
                <button className="btn btn-outline-primary w-100" onClick={showQr}>
                  <i className="bi bi-qr-code me-1"></i> Show QR code
                </button>
              )}
            </div>
          </div>

          {isAdmin && asset.status !== "RETIRED" && (
            <div className="card shadow-sm border-0 border-danger">
              <div className="card-header bg-white"><h5 className="mb-0">Retire</h5></div>
              <div className="card-body">
                {!retiring ? (
                  <button className="btn btn-outline-danger w-100" onClick={() => setRetiring(true)}
                          disabled={asset.status === "ASSIGNED"}>
                    <i className="bi bi-archive me-1"></i> Retire asset
                  </button>
                ) : (
                  <form onSubmit={retire}>
                    <label className="form-label" htmlFor="disposal">What happens to it?</label>
                    <select id="disposal" className="form-select mb-2" value={disposal}
                            onChange={(e) => setDisposal(e.target.value)}>
                      {DISPOSAL.map((d) => <option key={d} value={d}>{formatEnum(d)}</option>)}
                    </select>
                    <label className="form-label" htmlFor="retire-note">Note (optional)</label>
                    <input id="retire-note" className="form-control mb-2" maxLength={500}
                           value={retireNote} onChange={(e) => setRetireNote(e.target.value)} />
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-danger flex-grow-1" disabled={busy}>Retire</button>
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setRetiring(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                {asset.status === "ASSIGNED" && (
                  <div className="small text-muted mt-2">Receive the return before retiring.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;
