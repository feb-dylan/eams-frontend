import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import employeeApi from "../../services/employeeApi";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await employeeApi.getEmployeeById(id);

      setEmployee(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load employee."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-2">
          Loading employee...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          {error}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            Employee Details
          </h2>

          <p className="text-muted mb-0">
            Employee #{employee.id}
          </p>
        </div>

        <Link
          to="/employees"
          className="btn btn-outline-secondary"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Employees
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">
            {employee.firstName}{" "}
            {employee.lastName}
          </h5>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>Employee ID</strong>
              <div>{employee.id}</div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>User ID</strong>
              <div>
                {employee.userId ?? "Not linked"}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Employee Code</strong>
              <div>
                {employee.employeeCode}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Name</strong>
              <div>
                {employee.firstName}{" "}
                {employee.lastName}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Phone</strong>
              <div>
                {employee.phone || "-"}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Department</strong>
              <div>
                {employee.departmentName}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Position</strong>
              <div>
                {employee.position || "-"}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Hire Date</strong>
              <div>
                {employee.hireDate || "-"}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Status</strong>
              <div>
                <span
                  className={`badge ${
                    employee.status ===
                    "ACTIVE"
                      ? "bg-success"
                      : "bg-secondary"
                  }`}
                >
                  {employee.status}
                </span>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Created At</strong>
              <div>
                {employee.createdAt
                  ? new Date(
                      employee.createdAt
                    ).toLocaleString()
                  : "-"}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Updated At</strong>
              <div>
                {employee.updatedAt
                  ? new Date(
                      employee.updatedAt
                    ).toLocaleString()
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;