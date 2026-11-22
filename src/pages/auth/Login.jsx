import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DEMO_MODE, DEMO_PASSWORD } from "../../config";
import { getErrorMessage } from "../../utils/apiError";

const DEMO_ACCOUNTS = [
  { email: "admin@eams.demo", label: "Admin", icon: "bi-shield-lock" },
  { email: "manager@eams.demo", label: "Manager", icon: "bi-briefcase" },
  { email: "alice@eams.demo", label: "Employee", icon: "bi-person" },
  { email: "tech@eams.demo", label: "Technician", icon: "bi-tools" },
];

/** Only allow redirects inside this app (never to another site). */
function safeNext(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const expired = params.get("expired") === "1";
  const next = safeNext(params.get("next"));

  const doLogin = async (loginEmail, loginPassword) => {
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate(next, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(email.trim(), password);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: "#f5f7fb" }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                       style={{ width: 55, height: 55, background: "#0d6efd", color: "white" }}>
                    <i className="bi bi-box-seam-fill fs-4" aria-hidden="true"></i>
                  </div>
                  <h1 className="h3 fw-bold mb-1">Welcome back</h1>
                  <p className="text-muted mb-0">Log in to EAMS</p>
                </div>

                {expired && (
                  <div className="alert alert-warning" role="status">
                    Your session has expired. Please log in again.
                  </div>
                )}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">Email</label>
                    <input id="email" type="email" className="form-control" value={email}
                           onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                           disabled={loading} required />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <input id="password" type={showPassword ? "text" : "password"} className="form-control"
                             value={password} onChange={(e) => setPassword(e.target.value)}
                             autoComplete="current-password" disabled={loading} required />
                      <button type="button" className="btn btn-outline-secondary"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={showPassword ? "Hide password" : "Show password"}>
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="text-end mb-3">
                    <Link to="/forgot-password" className="small text-decoration-none">Forgot password?</Link>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                    {loading ? "Logging in..." : "Log in"}
                  </button>
                </form>

                {DEMO_MODE && (
                  <div className="mt-4">
                    <div className="text-center small text-muted mb-2">Try a demo account</div>
                    <div className="row g-2">
                      {DEMO_ACCOUNTS.map((a) => (
                        <div className="col-6" key={a.email}>
                          <button type="button" className="btn btn-outline-primary w-100 btn-sm"
                                  disabled={loading} onClick={() => doLogin(a.email, DEMO_PASSWORD)}>
                            <i className={`bi ${a.icon} me-1`}></i> {a.label}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center mt-4">
                  <span className="text-muted">No account?</span>{" "}
                  <Link to="/register" className="text-decoration-none fw-semibold">Register</Link>
                </div>
              </div>
            </div>
            <div className="text-center mt-3">
              <Link to="/" className="text-muted text-decoration-none small">
                <i className="bi bi-arrow-left me-1"></i> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
