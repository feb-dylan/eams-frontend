import { useEffect, useState } from "react";

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Photo input with previews. On phones `capture="environment"` opens the camera.
 * Validates type and size before upload (the server checks again).
 */
const PhotoPicker = ({ files, onChange, disabled }) => {
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const add = (e) => {
    setError("");
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    const valid = [];
    for (const f of picked) {
      if (!TYPES.includes(f.type)) {
        setError("Only JPEG, PNG or WEBP photos.");
      } else if (f.size > MAX_BYTES) {
        setError(`${f.name} is larger than 5 MB.`);
      } else {
        valid.push(f);
      }
    }
    const next = [...files, ...valid].slice(0, MAX_FILES);
    if (files.length + valid.length > MAX_FILES) setError(`At most ${MAX_FILES} photos.`);
    onChange(next);
  };

  const remove = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div>
      <label className="form-label" htmlFor="damage-photos">Photos (up to {MAX_FILES})</label>
      <input id="damage-photos" type="file" className="form-control" accept={TYPES.join(",")}
             capture="environment" multiple onChange={add} disabled={disabled || files.length >= MAX_FILES} />
      <div className="form-text">On a phone this opens the camera. A clear photo helps the AI assessment.</div>
      {error && <div className="text-danger small mt-1">{error}</div>}

      {previews.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {previews.map((url, i) => (
            <div key={url} className="position-relative">
              <img src={url} alt={`Damage photo ${i + 1}`} className="rounded border"
                   style={{ width: 96, height: 96, objectFit: "cover" }} />
              <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 py-0 px-1"
                      onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`} disabled={disabled}>
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoPicker;
