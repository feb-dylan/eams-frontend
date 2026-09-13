import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import departmentApi from "../../services/departmentApi";
import DepartmentForm from "../../components/departments/DepartmentForm";
import { useAuth } from "../../context/AuthContext";

const DepartmentList = () => {
  const { role } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const isAdmin = role === "ADMIN";

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await departmentApi.getDepartments();

      // Backend returns List<DepartmentResponse>
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load departments:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const openCreateForm = () => {
    setEditingDepartment(null);
    setShowForm(true);
  };

  const openEditForm = (department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      setError("");

      if (editingDepartment) {
        await departmentApi.updateDepartment(
          editingDepartment.id,
          data
        );
      } else {
        await departmentApi.createDepartment(data);
      }

      closeForm();
      await loadDepartments();
    } catch (err) {
      console.error("Failed to save department:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to save department."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${department.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await departmentApi.deleteDepartment(department.id);

      await loadDepartments();
    } catch (err) {
      console.error("Failed to delete department:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to delete department."
      );
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Department Management</h2>
          <p className="text-muted mb-0">
            Manage company departments
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={openCreateForm}
          >
            <i className="bi bi-building-add me-2"></i>
            Add Department
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              {editingDepartment
                ? "Edit Department"
                : "Create Department"}
            </h5>
          </div>

          <div className="card-body">
            <DepartmentForm
              initialData={editingDepartment}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              loading={saving}
            />
          </div>
        </div>
      )}

      {/* Department Table */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Departments</h5>

          <span className="badge bg-secondary">
            {departments.length} total
          </span>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="mt-2 mb-0">
                Loading departments...
              </p>
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-building fs-1"></i>

              <p className="mt-2 mb-0">
                No departments found.
              </p>

              {isAdmin && (
                <button
                  className="btn btn-primary mt-3"
                  onClick={openCreateForm}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Add First Department
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {departments.map((department) => (
                    <tr key={department.id}>
                      <td>{department.id}</td>

                      <td>
                        <strong>
                          {department.name}
                        </strong>
                      </td>

                      <td>
                        {department.description || "-"}
                      </td>

                      <td>
                        {department.createdAt
                          ? new Date(
                              department.createdAt
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        {department.updatedAt
                          ? new Date(
                              department.updatedAt
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        <div className="d-flex gap-1">
                          {/* View */}
                          <Link
                            to={`/departments/${department.id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>

                          {/* Edit + Delete */}
                          {isAdmin && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() =>
                                  openEditForm(department)
                                }
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDelete(department)
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
      </div>
    </div>
  );
};

export default DepartmentList;