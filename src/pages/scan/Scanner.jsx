import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assetCodeFromScan } from "../../utils/scan";

/**
 * In-app QR scanner using the browser's BarcodeDetector (Chrome / Android / Edge).
 * Where it is not available, the code can be typed in.
 * Tip: most phone cameras also open the QR link directly, without this page.
 */
const Scanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [supported] = useState(() => typeof window !== "undefined" && "BarcodeDetector" in window);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!scanning) return undefined;
    let stream;
    let frame;
    let stopped = false;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

        const tick = async () => {
          if (stopped) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) {
              navigate(`/a/${encodeURIComponent(assetCodeFromScan(codes[0].rawValue))}`);
              return;
            }
          } catch {
            /* frame not ready yet */
          }
          frame = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setCameraError("Camera not available. Allow camera access or type the code below.");
        setScanning(false);
      }
    };
    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning, navigate]);

  const submit = (e) => {
    e.preventDefault();
    const value = assetCodeFromScan(code);
    if (value) navigate(`/a/${encodeURIComponent(value)}`);
  };

  return (
    <div className="container py-3" style={{ maxWidth: 520 }}>
      <h2 className="mb-1">Scan an asset</h2>
      <p className="text-muted">Point the camera at the QR sticker on the asset.</p>

      {supported ? (
        scanning ? (
          <div className="mb-3">
            <video ref={videoRef} className="w-100 rounded bg-dark" playsInline muted aria-label="Camera preview" />
            <button className="btn btn-outline-secondary w-100 mt-2" onClick={() => setScanning(false)}>
              Stop camera
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-lg w-100 mb-3" onClick={() => setScanning(true)}>
            <i className="bi bi-camera me-2"></i> Start camera
          </button>
        )
      ) : (
        <div className="alert alert-info">
          This browser cannot scan in-app. Use your phone&apos;s camera app on the QR code, or type the code below.
        </div>
      )}

      {cameraError && <div className="alert alert-warning">{cameraError}</div>}

      <form onSubmit={submit} className="card card-body shadow-sm border-0">
        <label className="form-label fw-semibold" htmlFor="manual-code">Or enter the asset code</label>
        <div className="input-group">
          <input id="manual-code" className="form-control form-control-lg" placeholder="LAP-0042"
                 value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" />
          <button type="submit" className="btn btn-primary" disabled={!code.trim()}>Open</button>
        </div>
      </form>
    </div>
  );
};

export default Scanner;
