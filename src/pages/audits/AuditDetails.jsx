import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { auditApi } from "../../services/featureApi";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useConfirm, useToast } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/apiError";
import { assetCodeFromScan } from "../../utils/scan";
import { formatDateTime } from "../../utils/format";

const AuditDetails = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const inputRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [scannedLocation, setScannedLocation] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await auditApi.get(id));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load the audit."));
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const scan = async (e) => {
    e.preventDefault();
    const assetCode = assetCodeFromScan(code);
    if (!assetCode) return;
    setBusy(true);
    try {
      const saved = await auditApi.scan(id, {
        assetCode,
        scannedLocation: scannedLocation.trim() || null,
        result: result || null,
      });
      toast.success(`${saved.assetCode}: ${saved.result.replace("_", " ").toLowerCase()}`);
      setCode("");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Scan failed."));
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const close = async () => {
    if (!(await confirm({ title: "Close audit", message: "Close this audit? Unscanned assets will be reported as missing.",
      confirmText: "Close audit", variant: "warning" }))) return;
    try {
      setData(await auditApi.close(id));
      toast.success("Audit closed.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to close the audit."));
    }
  };

  if (loading) return <PageLoader text="Loading audit..." />;
  if (!data) return <div className="container py-4"><div className="alert alert-danger">Audit not found.</div></div>;

  const { campaign } = data;
  const open = campaign.status === "OPEN";

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0">{campaign.name}</h2>
            <StatusBadge value={campaign.status} />
          </div>
          <p className="text-muted mb-0">{campaign.location || "All locations"}</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/audits" className="btn btn-outline-secondary">All audits</Link>
          {open && role === "ADMIN" && <button className="btn btn-warning" onClick={close}>Close audit</button>}
        </div>
      </div>

      <div className="row g-3 mb-4 text-center">
        {[
          ["Expected", data.expected, "secondary"],
          ["Found", data.found, "success"],
          ["Wrong place", data.wrongLocation, "warning"],
          ["Damaged", data.damaged, "danger"],
          ["Missing", data.missing, "dark"],
        ].map(([label, value, color]) => (
          <div className="col" key={label}>
            <div className="card border-0 shadow-sm">
              <div className="card-body py-3">
                <div className={`fs-3 fw-bold text-${color}`}>{value}</div>
                <div className="small text-muted">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <form className="card card-body border-0 shadow-sm mb-4" onSubmit={scan}>
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label" htmlFor="audit-code">Asset code or QR text</label>
              <input id="audit-code" ref={inputRef} className="form-control form-control-lg" value={code}
                     onChange={(e) => setCode(e.target.value)} placeholder="Scan or type LAP-0042" autoFocus />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="audit-where">Found at (optional)</label>
              <input id="audit-where" className="form-control form-control-lg" value={scannedLocation}
                     onChange={(e) => setScannedLocation(e.target.value)} placeholder="Room" />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="audit-result">Result</label>
              <select id="audit-result" className="form-select form-select-lg" value={result}
                      onChange={(e) => setResult(e.target.value)}>
                <option value="">Auto (compare location)</option>
                <option value="FOUND">Found</option>
                <option value="WRONG_LOCATION">Wrong location</option>
                <option value="DAMAGED">Damaged</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={busy || !code.trim()}>Scan</button>
            </div>
          </div>
          <div className="form-text">A USB / Bluetooth barcode scanner works too: it types the code and presses Enter.</div>
        </form>
      )}

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white"><h5 className="mb-0">Missing ({data.missing})</h5></div>
            <ul className="list-group list-group-flush">
              {data.missingAssets.length === 0 && <li className="list-group-item text-muted">Nothing missing.</li>}
              {data.missingAssets.map((m) => (
                <li key={m.assetId} className="list-group-item d-flex justify-content-between">
                  <Link to={`/assets/${m.assetId}`}>{m.assetCode} - {m.assetName}</Link>
                  <span className="small text-muted">{m.expectedLocation || "-"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white"><h5 className="mb-0">Scanned ({data.scans.length})</h5></div>
            <ul className="list-group list-group-flush">
              {data.scans.length === 0 && <li className="list-group-item text-muted">No scans yet.</li>}
              {[...data.scans].reverse().map((s) => (
                <li key={s.id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <span><strong>{s.assetCode}</strong> {s.assetName}</span>
                    <StatusBadge value={s.result} />
                  </div>
                  <div className="small text-muted">
                    {s.scannedLocation && s.scannedLocation !== s.expectedLocation
                      ? `Found at ${s.scannedLocation} (expected ${s.expectedLocation || "-"}) · ` : ""}
                    {formatDateTime(s.scannedAt)} by {s.scannedBy}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditDetails;
