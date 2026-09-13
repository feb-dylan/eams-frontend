import { useState } from "react";

const ChangePasswordForm = ({ onSubmit, loading = false }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      await onSubmit(currentPassword, newPassword);
      setSuccess("Password changed successfully.");
      reset();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to change password."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      <div className="mb-3">
        <label className="form-label">Current Password</label>
        <div className="input-group">
          <input
            type={showCurrent ? "text" : "password"}
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowCurrent((v) => !v)}
          >
            <i
              className={`bi ${
                showCurrent ? "bi-eye-slash" : "bi-eye"
              }`}
            ></i>
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">New Password</label>
        <div className="input-group">
          <input
            type={showNew ? "text" : "password"}
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowNew((v) => !v)}
          >
            <i
              className={`bi ${
                showNew ? "bi-eye-slash" : "bi-eye"
              }`}
            ></i>
          </button>
        </div>
        <div className="form-text">Minimum 8 characters.</div>
      </div>

      <div className="mb-3">
        <label className="form-label">Confirm New Password</label>
        <input
          type="password"
          className="form-control"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="btn btn-warning"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Updating...
          </>
        ) : (
          "Change Password"
        )}
      </button>
    </form>
  );
};

export default ChangePasswordForm;