import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import departmentApi from "../../services/departmentApi";

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] =
    useState(null);

  const [employees, setEmployees] =
    useState([]);

  const [employeePage, setEmployeePage] =
    useState(0);

  const [employeeTotalPages, setEmployeeTotalPages] =
    useState(0);

  const [employeeTotalElements, setEmployeeTotalElements] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [employeesLoading, setEmployeesLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [employeesError, setEmployeesError] =
    useState("");

  const employeePageSize = 10;

  useEffect(() => {
    loadDepartment();
  }, [id]);

  useEffect(() => {
    loadEmployees();
  }, [id, employeePage]);

  const loadDepartment = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await departmentApi.getDepartmentById(
          id
        );

      setDepartment(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load department."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      setEmployeesError("");

      const data =
        await departmentApi.getEmployeesByDepartment(
          id,
          employeePage,
          employeePageSize
        );

      setEmployees(data.content || []);
      setEmployeeTotalPages(
        data.totalPages || 0
      );
      setEmployeeTotalElements(
        data.totalElements || 0
      );
    } catch (err) {
      console.error(err);

      setEmployeesError(
        err.response?.data?.message ||
          "Failed to load employees."
      );
    } finally {
      setEmployeesLoading(false);
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
          Loading department...
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

  if (!department) {
    return null;
  }

  return (
    <div className="container-fluid py-4">

      {/* ================================
          HEADER
      ================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            Department Details
          </h2>

          <p className="text-muted mb-0">
            Department #{department.id}
          </p>
        </div>

        <Link
          to="/departments"
          className="btn btn-outline-secondary"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Departments
        </Link>
      </div>

      {/* ================================
          DEPARTMENT INFORMATION
      ================================= */}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {department.name}
          </h5>
        </div>

        <div className="card-body">
          <div className="row">

            <div className="col-md-6 mb-4">
              <strong>Department ID</strong>

              <div>
                {department.id}
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <strong>Name</strong>

              <div>
                {department.name}
              </div>
            </div>

            <div className="col-12 mb-4">
              <strong>Description</strong>

              <div className="mt-1">
                {department.description ||
                  "No description"}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Created At</strong>

              <div>
                {department.createdAt
                  ? new Date(
                      department.createdAt
                    ).toLocaleString()
                  : "-"}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Updated At</strong>

              <div>
                {department.updatedAt
                  ? new Date(
                      department.updatedAt
                    ).toLocaleString()
                  : "-"}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================================
          EMPLOYEES
      ================================= */}

      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Employees in this Department
          </h5>

          {!employeesLoading && (
            <span className="badge bg-primary">
              {employeeTotalElements}
            </span>
          )}
        </div>

        <div className="card-body">

          {employeesLoading ? (
            <div className="text-center py-4">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="mt-2 mb-0">
                Loading employees...
              </p>
            </div>
          ) : employeesError ? (
            <div className="alert alert-danger mb-0">
              {employeesError}
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-people fs-1 d-block mb-2"></i>

              <p className="mb-0">
                No employees are assigned to this department.
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">

                  <thead>
                    <tr>
                      <th>Employee Code</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th className="text-end">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>

                        <td>
                          {employee.employeeCode}
                        </td>

                        <td>
                          <Link
                            to={`/employees/${employee.id}`}
                            className="text-decoration-none fw-semibold"
                          >
                            {employee.firstName}{" "}
                            {employee.lastName}
                          </Link>
                        </td>

                        <td>
                          {employee.position || "-"}
                        </td>

                        <td>
                          {employee.status ? (
                            <span className="badge bg-success">
                              {employee.status}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="text-end">
                          <Link
                            to={`/employees/${employee.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </Link>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* ================================
                  PAGINATION
              ================================= */}

              {employeeTotalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">

                  <div className="text-muted small">
                    Page {employeePage + 1} of{" "}
                    {employeeTotalPages}
                  </div>

                  <div className="btn-group">

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={employeePage === 0}
                      onClick={() =>
                        setEmployeePage(
                          (previous) =>
                            previous - 1
                        )
                      }
                    >
                      <i className="bi bi-chevron-left me-1"></i>
                      Previous
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={
                        employeePage >=
                        employeeTotalPages - 1
                      }
                      onClick={() =>
                        setEmployeePage(
                          (previous) =>
                            previous + 1
                        )
                      }
                    >
                      Next
                      <i className="bi bi-chevron-right ms-1"></i>
                    </button>

                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default DepartmentDetails;