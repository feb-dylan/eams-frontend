import { useState } from "react";
import authApi from "../../services/authApi";
import AuthCard from "./AuthCard";
import { getErrorMessage } from "../../utils/apiError";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email.trim());
      setMessage(result.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send the reset link."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard icon="bi-key" title="Forgot password" subtitle="We'll email you a link to choose a new one">
      {message ? (
        <div className="alert alert-success" role="status">{message}</div>
      ) : (
        <form onSubmit={submit}>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="mb-3">
            <label htmlFor="forgot-email" className="form-label fw-semibold">Email</label>
            <input id="forgot-email" type="email" className="form-control" value={email}
                   onChange={(e) => setEmail(e.target.value)} autoComplete="email" required disabled={loading} />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading || !email.trim()}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
