import { useEffect, useState } from "react";

const EmployeeForm = ({
  initialData,
  departments,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    userId: "",
    employeeCode: "",
    firstName: "",
    lastName: "",
    phone: "",
    departmentId: "",
    position: "",
    hireDate: "",
    status: "ACTIVE",
  });

  // =========================================================
  // LOAD INITIAL DATA
  // =========================================================

  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId ?? "",
        employeeCode: initialData.employeeCode ?? "",
        firstName: initialData.firstName ?? "",
        lastName: initialData.lastName ?? "",
        phone: initialData.phone ?? "",
        departmentId: initialData.departmentId ?? "",
        position: initialData.position ?? "",
        hireDate: initialData.hireDate ?? "",
        status: initialData.status ?? "ACTIVE",
      });
    } else {
      setFormData({
        userId: "",
        employeeCode: "",
        firstName: "",
        lastName: "",
        phone: "",
        departmentId: "",
        position: "",
        hireDate: "",
        status: "ACTIVE",
      });
    }
  }, [initialData]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      // User ID is kept from the existing employee.
      // It cannot be changed from this form.
      userId:
        formData.userId === ""
          ? null
          : Number(formData.userId),

      employeeCode: formData.employeeCode.trim(),

      firstName: formData.firstName.trim(),

      lastName: formData.lastName.trim(),

      phone:
        formData.phone.trim() === ""
          ? null
          : formData.phone.trim(),

      // Department ID is sent to backend.
      departmentId: Number(formData.departmentId),

      position:
        formData.position.trim() === ""
          ? null
          : formData.position.trim(),

      hireDate:
        formData.hireDate === ""
          ? null
          : formData.hireDate,

      status: formData.status,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">

        {/* =====================================================
            USER ID - READ ONLY
        ===================================================== */}

        <div className="col-md-6 mb-3">
          <label className="form-label">
            User ID
          </label>

          <input
            type="text"
            name="userId"
            className="form-control bg-light"
            value={formData.userId}
            readOnly
          />

          <div className="form-text">
            User ID cannot be changed.
          </div>
        </div>

        {/* =====================================================
            EMPLOYEE CODE
        ===================================================== */}

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Employee Code
          </label>

          <input
            type="text"
            name="employeeCode"
            className="form-control"
            value={formData.employeeCode}
            onChange={handleChange}
            maxLength={50}
            required
            disabled={loading}
          />
        </div>

        {/* =====================================================
            FIRST NAME
        ===================================================== */}

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

        {/* =====================================================
            LAST NAME
        ===================================================== */}

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

        {/* =====================================================
            PHONE
        ===================================================== */}

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
            maxLength={30}
            disabled={loading}
            placeholder="Enter phone number"
          />
        </div>

        {/* =====================================================
            DEPARTMENT
        ===================================================== */}

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Department
          </label>

          <select
            name="departmentId"
            className="form-select"
            value={formData.departmentId}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">
              Select Department
            </option>

            {departments.map((department) => (
              <option
                key={department.id}
                value={department.id}
              >
                {department.name}
              </option>
            ))}
          </select>

          <div className="form-text">
            Select the employee's department.
          </div>
        </div>

        {/* =====================================================
            POSITION
        ===================================================== */}

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Position
          </label>

          <input
            type="text"
            name="position"
            className="form-control"
            value={formData.position}
            onChange={handleChange}
            maxLength={100}
            disabled={loading}
            placeholder="e.g. Software Developer"
          />
        </div>

        {/* =====================================================
            HIRE DATE
        ===================================================== */}

        <div className="col-md-6 mb-3">
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

        {/* =====================================================
            STATUS
        ===================================================== */}

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Status
          </label>

          <select
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* =====================================================
          BUTTONS
      ===================================================== */}

      <div className="d-flex gap-2 mt-3">

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            loading ||
            !formData.departmentId
          }
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
            "Update Employee"
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;