import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import authApi from "../../services/authApi";
import AuthCard from "./AuthCard";
import { getErrorMessage } from "../../utils/apiError";

/** Used by both "forgot password" emails and invitation emails (?invite=1). */
const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const isInvite = params.get("invite") === "1";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, "This link is invalid or has expired."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard icon={isInvite ? "bi-envelope-open" : "bi-shield-lock"}
              title={isInvite ? "Welcome to EAMS" : "Choose a new password"}
              subtitle={isInvite ? "Set a password to activate your account" : null}>
      {!token ? (
        <div className="alert alert-danger">This link is missing its token. Please use the link from your email.</div>
      ) : done ? (
        <div className="text-center">
          <div className="alert alert-success">Your password is set.</div>
          <Link to="/login" className="btn btn-primary">Log in</Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="mb-3">
            <label htmlFor="new-password" className="form-label fw-semibold">New password</label>
            <input id="new-password" type="password" className="form-control" minLength={8} maxLength={100}
                   value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                   disabled={loading} required />
            <div className="form-text">At least 8 characters.</div>
          </div>
          <div className="mb-4">
            <label htmlFor="confirm-password" className="form-label fw-semibold">Confirm password</label>
            <input id="confirm-password" type="password" className="form-control" value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password"
                   disabled={loading} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Saving..." : "Set password"}
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
