import { useState } from "react";
import employeeApi from "../../services/employeeApi";

const EmployeeProfileForm = ({ onProfileCreated }) => {
  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    phone: "",
    departmentId: "",
    position: "",
    hireDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const employeeData = {
        employeeCode: formData.employeeCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        departmentId: Number(formData.departmentId),
        position: formData.position || null,
        hireDate: formData.hireDate || null,
      };

      const employee =
        await employeeApi.createCurrentEmployee(
          employeeData
        );

      onProfileCreated(employee);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to create employee profile."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">

          <div className="card shadow-sm">
            <div className="card-body p-4">

              <h2 className="mb-2">
                Complete Your Employee Profile
              </h2>

              <p className="text-muted mb-4">
                Your account has been created, but you
                don't have an employee profile yet.
                Please complete the information below.
              </p>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label">
                    Employee Code
                  </label>

                  <input
                    type="text"
                    name="employeeCode"
                    className="form-control"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    placeholder="Example: EMP002"
                    required
                  />
                </div>

                <div className="row">

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      First Name
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      className="form-control"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      className="form-control"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Department ID
                  </label>

                  <input
                    type="number"
                    name="departmentId"
                    className="form-control"
                    value={formData.departmentId}
                    onChange={handleChange}
                    placeholder="Example: 1"
                    min="1"
                    required
                  />

                  <small className="text-muted">
                    Enter the ID of your department.
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Position
                  </label>

                  <input
                    type="text"
                    name="position"
                    className="form-control"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Example: Software Developer"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Hire Date
                  </label>

                  <input
                    type="date"
                    name="hireDate"
                    className="form-control"
                    value={formData.hireDate}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Profile..."
                    : "Create Employee Profile"}
                </button>

              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileForm;