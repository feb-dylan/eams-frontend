import { useEffect, useState } from "react";

const ProfileForm = ({
  employee,
  onSubmit,
  loading = false,
}) => {
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setPhone(employee.phone || "");
      setPosition(employee.position || "");
    }

    setError("");
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (phone.length > 30) {
      setError("Phone must not exceed 30 characters.");
      return;
    }

    if (position.length > 100) {
      setError("Position must not exceed 100 characters.");
      return;
    }

    try {
      await onSubmit({
        phone: phone.trim() || null,
        position: position.trim() || null,
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to update profile."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="row g-3">

        {/* Email */}
        <div className="col-md-6">
          <label className="form-label">
            Email
          </label>

          <input
            type="text"
            className="form-control bg-light"
            value={employee?.email || "-"}
            disabled
          />

          <div className="form-text">
            Email cannot be changed here.
          </div>
        </div>

        {/* Employee Code */}
        <div className="col-md-6">
          <label className="form-label">
            Employee Code
          </label>

          <input
            type="text"
            className="form-control bg-light"
            value={employee?.employeeCode || "-"}
            disabled
          />

          <div className="form-text">
            Employee code cannot be changed here.
          </div>
        </div>

        {/* First Name */}
        <div className="col-md-6">
          <label className="form-label">
            First Name
          </label>

          <input
            type="text"
            className="form-control bg-light"
            value={employee?.firstName || "-"}
            disabled
          />
        </div>

        {/* Last Name */}
        <div className="col-md-6">
          <label className="form-label">
            Last Name
          </label>

          <input
            type="text"
            className="form-control bg-light"
            value={employee?.lastName || "-"}
            disabled
          />
        </div>

        {/* Department */}
        <div className="col-md-6">
          <label className="form-label">
            Department
          </label>

          <input
            type="text"
            className="form-control bg-light"
            value={employee?.departmentName || "-"}
            disabled
          />
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <label className="form-label">
            Phone
          </label>

          <input
            type="text"
            className="form-control"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            placeholder="Enter phone number"
          />
        </div>

        {/* Position */}
        <div className="col-12">
          <label className="form-label">
            Position
          </label>

          <input
            type="text"
            className="form-control"
            maxLength={100}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={loading}
            placeholder="Enter your position"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="d-flex gap-2 mt-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-2"></i>
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
