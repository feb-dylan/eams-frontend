import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import authApi from "../../services/authApi";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =====================================================
    // FRONTEND VALIDATION
    // =====================================================

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // ===================================================
      // REGISTER
      // ===================================================

      const message = await authApi.register(
        email.trim(),
        password
      );

      console.log("Registration successful:", message);

      setSuccess(
        typeof message === "string"
          ? message
          : "Registration successful. Please check your email to verify your account."
      );

      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("Registration failed:", error);

      // ===================================================
      // BACKEND ERROR HANDLING
      // ===================================================

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (typeof error.response?.data === "string") {
        setError(error.response.data);
      } else if (error.response?.status === 409) {
        setError("Email already exists.");
      } else if (error.response?.status === 400) {
        setError(
          "Please check your email and password and try again."
        );
      } else {
        setError(
          "Registration failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: "#f5f7fb",
      }}
    >
      <div className="container py-5">
        <div className="row justify-content-center">

          <div className="col-12 col-sm-10 col-md-7 col-lg-5">

            {/* =================================================
                REGISTER CARD
            ================================================== */}

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4 p-md-5">

                {/* =================================================
                    BRAND
                ================================================== */}

                <div className="text-center mb-4">

                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{
                      width: "55px",
                      height: "55px",
                      background: "#0d6efd",
                      color: "white",
                    }}
                  >
                    <i className="bi bi-box-seam-fill fs-4"></i>
                  </div>

                  <h2 className="fw-bold mb-1">
                    Create Account
                  </h2>

                  <p className="text-muted mb-0">
                    Join EAMS to manage your assets
                  </p>

                </div>

                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-start"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-circle me-2 mt-1"></i>

                    <div>
                      {error}
                    </div>
                  </div>
                )}

                {/* =================================================
                    SUCCESS
                ================================================== */}

                {success && (
                  <div
                    className="alert alert-success"
                    role="alert"
                  >
                    <div className="d-flex align-items-start">

                      <i className="bi bi-check-circle me-2 mt-1"></i>

                      <div>
                        <div>{success}</div>

                        <div className="mt-3">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => navigate("/login")}
                          >
                            Go to Login
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* =================================================
                    REGISTER FORM
                ================================================== */}

                {!success && (
                  <form onSubmit={handleSubmit}>

                    {/* =============================================
                        EMAIL
                    ============================================== */}

                    <div className="mb-3">

                      <label
                        htmlFor="email"
                        className="form-label fw-semibold"
                      >
                        Email
                      </label>

                      <div className="input-group">

                        <span className="input-group-text">
                          <i className="bi bi-envelope"></i>
                        </span>

                        <input
                          id="email"
                          type="email"
                          className="form-control"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          disabled={loading}
                          autoComplete="email"
                          required
                        />

                      </div>

                    </div>

                    {/* =============================================
                        PASSWORD
                    ============================================== */}

                    <div className="mb-3">

                      <label
                        htmlFor="password"
                        className="form-label fw-semibold"
                      >
                        Password
                      </label>

                      <div className="input-group">

                        <span className="input-group-text">
                          <i className="bi bi-lock"></i>
                        </span>

                        <input
                          id="password"
                          type="password"
                          className="form-control"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          disabled={loading}
                          autoComplete="new-password"
                          minLength={8}
                          required
                        />

                      </div>

                      <div className="form-text">
                        Password must be at least 8 characters.
                      </div>

                    </div>

                    {/* =============================================
                        CONFIRM PASSWORD
                    ============================================== */}

                    <div className="mb-4">

                      <label
                        htmlFor="confirmPassword"
                        className="form-label fw-semibold"
                      >
                        Confirm Password
                      </label>

                      <div className="input-group">

                        <span className="input-group-text">
                          <i className="bi bi-lock-fill"></i>
                        </span>

                        <input
                          id="confirmPassword"
                          type="password"
                          className="form-control"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          disabled={loading}
                          autoComplete="new-password"
                          minLength={8}
                          required
                        />

                      </div>

                    </div>

                    {/* =============================================
                        REGISTER BUTTON
                    ============================================== */}

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>

                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Create Account
                        </>
                      )}
                    </button>

                  </form>
                )}

                {/* =================================================
                    LOGIN LINK
                ================================================== */}

                <div className="text-center mt-4">

                  <span className="text-muted">
                    Already have an account?
                  </span>{" "}

                  <Link
                    to="/login"
                    className="text-decoration-none fw-semibold"
                  >
                    Login
                  </Link>

                </div>

              </div>
            </div>

            {/* =================================================
                BACK TO HOME
            ================================================== */}

            <div className="text-center mt-3">

              <Link
                to="/"
                className="text-muted text-decoration-none small"
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back to Home
              </Link>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;