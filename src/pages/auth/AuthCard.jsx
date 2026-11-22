import { Link } from "react-router-dom";

/** Shared centered card layout for the small auth pages. */
const AuthCard = ({ icon, title, subtitle, children }) => (
  <div className="min-vh-100 d-flex align-items-center" style={{ background: "#f5f7fb" }}>
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <i className={`bi ${icon} text-primary fs-1`} aria-hidden="true"></i>
                <h1 className="h3 fw-bold mt-2 mb-1">{title}</h1>
                {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
              </div>
              {children}
            </div>
          </div>
          <div className="text-center mt-3">
            <Link to="/login" className="text-muted text-decoration-none small">
              <i className="bi bi-arrow-left me-1"></i> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AuthCard;
