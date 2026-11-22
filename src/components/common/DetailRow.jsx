/** Label / value row used on detail pages. */
const DetailRow = ({ label, children }) => (
  <div className="row mb-3">
    <div className="col-md-4 fw-semibold text-muted">{label}</div>
    <div className="col-md-8">{children ?? "-"}</div>
  </div>
);

export default DetailRow;
