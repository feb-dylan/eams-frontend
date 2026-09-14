import { useEffect, useState } from "react";

import employeeApi from "../../services/employeeApi";
import departmentApi from "../../services/departmentApi";
import { useAuth } from "../../context/AuthContext";

const EmployeeProfileForm = ({ onProfileCreated }) => {
  const { refreshEmployee } = useAuth();

  const [departments, setDepartments] = useState([]);

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
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD ALL DEPARTMENTS
  // =========================================================

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setError("");

        const data = await departmentApi.getDepartments();

        console.log("Departments API response:", data);

        // Backend returns a normal array
        if (Array.isArray(data)) {
          setDepartments(data);
        }

        // Backend returns Spring Page
        else if (Array.isArray(data?.content)) {
          setDepartments(data.content);
        }

        // Unexpected response
        else {
          setDepartments([]);
          setError("No departments found.");
        }
      } catch (err) {
        console.error("Failed to load departments:", err);

        setDepartments([]);

        setError(
          err.response?.data?.message ||
            (typeof err.response?.data === "string"
              ? err.response.data
              : "Failed to load departments.")
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Department is required
    if (!formData.departmentId) {
      setError("Please select your department.");
      return;
    }

    setLoading(true);

    try {
      const employeeData = {
        employeeCode: formData.employeeCode.trim(),

        firstName: formData.firstName.trim(),

        lastName: formData.lastName.trim(),

        phone:
          formData.phone.trim() === ""
            ? null
            : formData.phone.trim(),

        departmentId: Number(formData.departmentId),

        position:
          formData.position.trim() === ""
            ? null
            : formData.position.trim(),

        hireDate:
          formData.hireDate === ""
            ? null
            : formData.hireDate,
      };

      console.log(
        "Creating employee profile:",
        employeeData
      );

      // Create employee profile in database
      const employee =
        await employeeApi.createCurrentEmployee(
          employeeData
        );

      console.log(
        "Employee profile created:",
        employee
      );

      // IMPORTANT:
      // Refresh AuthContext so employeeId is updated
      await refreshEmployee();

      console.log(
        "Employee context refreshed successfully."
      );

      // Tell parent component that profile creation succeeded
      onProfileCreated(employee);

    } catch (err) {
      console.error(
        "Failed to create employee profile:",
        err
      );

      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : "Failed to create employee profile.")
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body p-4">

              {/* Header */}
              <h2 className="mb-2">
                Complete Your Employee Profile
              </h2>

              <p className="text-muted mb-4">
                Your account has been created, but you
                don't have an employee profile yet.
                Please complete the information below.
              </p>

              {/* Error */}
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Employee Code */}
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
                    maxLength={50}
                    required
                    disabled={loading}
                  />
                </div>

                {/* First Name / Last Name */}
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
                      maxLength={100}
                      required
                      disabled={loading}
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
                      maxLength={100}
                      required
                      disabled={loading}
                    />
                  </div>

                </div>

                {/* Phone */}
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
                    maxLength={30}
                    disabled={loading}
                  />
                </div>

                {/* Department */}
                <div className="mb-3">
                  <label className="form-label">
                    Department
                  </label>

                  <select
                    name="departmentId"
                    className="form-select"
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                    disabled={
                      loading ||
                      loadingDepartments
                    }
                  >
                    <option value="">
                      {loadingDepartments
                        ? "Loading departments..."
                        : "Select your department"}
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.name}
                        </option>
                      )
                    )}
                  </select>

                  {/* Loading message */}
                  {loadingDepartments && (
                    <div className="form-text">
                      Loading departments...
                    </div>
                  )}

                  {/* Successfully loaded */}
                  {!loadingDepartments &&
                    departments.length > 0 && (
                      <div className="form-text">
                        Select the department you
                        belong to.
                      </div>
                    )}

                  {/* No departments */}
                  {!loadingDepartments &&
                    departments.length === 0 &&
                    !error && (
                      <div className="form-text text-danger">
                        No departments are available.
                        Please contact an administrator.
                      </div>
                    )}
                </div>

                {/* Position */}
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
                    maxLength={100}
                    disabled={loading}
                  />
                </div>

                {/* Hire Date */}
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
                    disabled={loading}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={
                    loading ||
                    loadingDepartments ||
                    departments.length === 0
                  }
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>

                      Creating Profile...
                    </>
                  ) : (
                    "Create Employee Profile"
                  )}
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