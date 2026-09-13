import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import employeeApi from "../../services/employeeApi";
import departmentApi from "../../services/departmentApi";
import EmployeeForm from "../../components/employees/EmployeeForm";
import { useAuth } from "../../context/AuthContext";

const EmployeeList = () => {
  const { role } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Used only for editing
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = role === "ADMIN";

  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load departments."
      );
    }
  };

  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      let data;

      if (searchText.trim()) {
        data = await employeeApi.searchEmployees(
          searchText.trim(),
          page,
          size
        );
      } else {
        data = await employeeApi.getEmployees(page, size);
      }

      setEmployees(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load employees."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EFFECTS
  // =========================================================

  useEffect(() => {
    loadDepartments();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadEmployees();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchText]);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(0);
    setSearchText(keyword);
  };

  const clearSearch = () => {
    setKeyword("");
    setSearchText("");
    setPage(0);
  };

  // =========================================================
  // EDIT EMPLOYEE
  // =========================================================

  const openEditForm = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);

    // Scroll to the form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // CLOSE EDIT FORM
  // =========================================================

  const closeForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  // =========================================================
  // UPDATE EMPLOYEE
  // =========================================================

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      setError("");

      // Only update is allowed here.
      // There is NO create employee functionality.
      if (editingEmployee) {
        await employeeApi.updateEmployee(
          editingEmployee.id,
          data
        );
      }

      closeForm();

      await loadEmployees();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to update employee."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE EMPLOYEE
  // =========================================================

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await employeeApi.deleteEmployee(employee.id);

      await loadEmployees();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to delete employee."
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="container-fluid py-4">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Employee Management
          </h2>

          <p className="text-muted mb-0">
            Manage EAMS employees
          </p>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* =====================================================
          EDIT EMPLOYEE FORM
          No CREATE form
      ===================================================== */}

      {showForm && isAdmin && editingEmployee && (
        <div className="card shadow-sm mb-4">

          <div className="card-header d-flex justify-content-between align-items-center">

            <h5 className="mb-0">
              Edit Employee
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={closeForm}
              aria-label="Close"
            ></button>

          </div>

          <div className="card-body">

            <EmployeeForm
              initialData={editingEmployee}
              departments={departments}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              loading={saving}
            />

          </div>
        </div>
      )}

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <form
            onSubmit={handleSearch}
            className="row g-2"
          >

            <div className="col-md-10">

              <input
                type="text"
                className="form-control"
                placeholder="Search by employee code or name..."
                value={keyword}
                onChange={(e) =>
                  setKeyword(e.target.value)
                }
              />

            </div>

            <div className="col-md-2 d-flex gap-2">

              <button
                type="submit"
                className="btn btn-primary flex-grow-1"
              >
                <i className="bi bi-search me-1"></i>
                Search
              </button>

              {searchText && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={clearSearch}
                >
                  Clear
                </button>
              )}

            </div>

          </form>

        </div>

      </div>

      {/* =====================================================
          EMPLOYEE TABLE
      ===================================================== */}

      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between">

          <h5 className="mb-0">
            Employees
          </h5>

          <span className="badge bg-secondary">
            {totalElements} total
          </span>

        </div>

        <div className="card-body p-0">

          {/* LOADING */}

          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="mt-2 mb-0">
                Loading employees...
              </p>

            </div>

          ) : employees.length === 0 ? (

            /* EMPTY */

            <div className="text-center py-5 text-muted">

              <i className="bi bi-people fs-1"></i>

              <p className="mt-2 mb-0">
                No employees found.
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Hire Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {employees.map((employee) => (

                    <tr key={employee.id}>

                      <td>
                        {employee.id}
                      </td>

                      <td>
                        <strong>
                          {employee.employeeCode}
                        </strong>
                      </td>

                      <td>
                        {employee.firstName}{" "}
                        {employee.lastName}
                      </td>

                      <td>
                        {employee.phone || "-"}
                      </td>

                      <td>
                        {employee.departmentName || "-"}
                      </td>

                      <td>
                        {employee.position || "-"}
                      </td>

                      <td>
                        {employee.hireDate || "-"}
                      </td>

                      <td>

                        <span
                          className={`badge ${
                            employee.status === "ACTIVE"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {employee.status}
                        </span>

                      </td>

                      <td>

                        <div className="d-flex gap-1">

                          {/* VIEW */}

                          <Link
                            to={`/employees/${employee.id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>

                          {/* ADMIN: EDIT + DELETE */}

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-warning"
                                onClick={() =>
                                  openEditForm(employee)
                                }
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDelete(employee)
                                }
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </>
                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {!loading && totalPages > 0 && (

          <div className="card-footer">

            <div className="d-flex justify-content-between align-items-center">

              <span className="text-muted">
                Page {page + 1} of {totalPages}
              </span>

              <div className="btn-group">

                <button
                  className="btn btn-outline-secondary"
                  disabled={page === 0}
                  onClick={() =>
                    setPage((p) =>
                      Math.max(0, p - 1)
                    )
                  }
                >
                  <i className="bi bi-chevron-left"></i>
                  {" "}Previous
                </button>

                <button
                  className="btn btn-outline-secondary"
                  disabled={
                    page >= totalPages - 1
                  }
                  onClick={() =>
                    setPage((p) => p + 1)
                  }
                >
                  Next
                  <i className="bi bi-chevron-right ms-1"></i>
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default EmployeeList;
