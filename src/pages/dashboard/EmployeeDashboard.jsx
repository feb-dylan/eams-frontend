import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import employeeApi from "../../services/employeeApi";

import dashboardApi from "../../services/dashboardApi";

import EmployeeProfileForm from "../employees/EmployeeProfileForm";

import KpiCard from "../../components/dashboard/KpiCard";

const EmployeeDashboard = () => {

  const [employee, setEmployee] = useState(null);

  const [dashboard, setDashboard] = useState(null);

  const [assignedAssets, setAssignedAssets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadingAssets, setLoadingAssets] = useState(false);

  const [error, setError] = useState("");

  const [profileMissing, setProfileMissing] = useState(false);

  const loadEmployeeDashboard = async () => {

    try {

      setLoading(true);

      setError("");

      const employeeData =
        await employeeApi.getCurrentEmployee();

      setEmployee(employeeData);

      setProfileMissing(false);

      const dashboardData =
        await dashboardApi.getEmployeeDashboard(
          employeeData.id
        );

      setDashboard(dashboardData);

      // =====================================================
      // LOAD CURRENTLY ASSIGNED ASSETS
      // =====================================================

      setLoadingAssets(true);

      const assignedData =
        await employeeApi.getMyAssignedAssets(
          employeeData.id
        );

      setAssignedAssets(assignedData);

    } catch (err) {

      console.error(err);

      if (err.response?.status === 404) {

        setProfileMissing(true);

        setEmployee(null);

        setDashboard(null);

        setAssignedAssets([]);

      } else {

        setError(
          err.response?.data?.message ||
            "Failed to load employee dashboard."
        );

      }

    } finally {

      setLoading(false);

      setLoadingAssets(false);
    }
  };

  useEffect(() => {

    loadEmployeeDashboard();

  }, []);

  const handleProfileCreated = async (createdEmployee) => {

    setEmployee(createdEmployee);

    setProfileMissing(false);

    try {

      const dashboardData =
        await dashboardApi.getEmployeeDashboard(
          createdEmployee.id
        );

      setDashboard(dashboardData);

      // =====================================================
      // LOAD ASSIGNED ASSETS AFTER PROFILE CREATION
      // =====================================================

      const assignedData =
        await employeeApi.getMyAssignedAssets(
          createdEmployee.id
        );

      setAssignedAssets(assignedData);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
          "Profile was created, but dashboard could not be loaded."
      );
    }
  };

  if (loading) {

    return (

      <div className="container mt-5 text-center">

        <div className="spinner-border" role="status">

          <span className="visually-hidden">
            Loading...
          </span>

        </div>

        <p className="mt-3">
          Loading your employee profile...
        </p>

      </div>
    );
  }

  if (profileMissing) {

    return (
      <EmployeeProfileForm
        onProfileCreated={handleProfileCreated}
      />
    );
  }

  if (error) {

    return (

      <div className="container mt-5">

        <div className="alert alert-danger">
          {error}
        </div>

      </div>
    );
  }

  return (

    <div className="container-fluid px-4 py-4">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">

        <div>

          <h2 className="fw-bold mb-1">
            Employee Dashboard
          </h2>

          <p className="text-muted mb-0">

            Welcome,{" "}

            <span className="text-dark fw-semibold">

              {employee?.firstName}{" "}
              {employee?.lastName}

            </span>

          </p>

        </div>

        <div className="d-flex gap-2">

          <Link
            to="/requests"
            className="btn btn-primary"
          >

            <i className="bi bi-file-earmark-plus me-1"></i>

            My Requests

          </Link>

          <Link
            to="/damage"
            className="btn btn-outline-danger"
          >

            <i className="bi bi-exclamation-triangle me-1"></i>

            Report Damage

          </Link>

        </div>

      </div>

      {/* =====================================================
          EMPLOYEE INFORMATION
      ===================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="mb-3">

            <i className="bi bi-person-badge me-2 text-primary"></i>

            Employee Information

          </h5>

          <div className="row">

            <div className="col-md-6 mb-2">

              <strong>Employee Code:</strong>{" "}

              {employee?.employeeCode}

            </div>

            <div className="col-md-6 mb-2">

              <strong>Department:</strong>{" "}

              {employee?.departmentName}

            </div>

            <div className="col-md-6 mb-2">

              <strong>Position:</strong>{" "}

              {employee?.position || "Not specified"}

            </div>

            <div className="col-md-6 mb-2">

              <strong>Phone:</strong>{" "}

              {employee?.phone || "Not specified"}

            </div>

            <div className="col-md-6 mb-2">

              <strong>Status:</strong>{" "}

              <span className="badge bg-success-subtle text-success-emphasis">

                {employee?.status}

              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          KPIs
      ===================================================== */}

      <div className="row g-3 mb-4">

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Pending Requests"
            value={dashboard?.pendingRequests}
            icon="bi-hourglass-split"
            color="warning"
            linkTo="/requests"
          />

        </div>

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Approved Requests"
            value={dashboard?.approvedRequests}
            icon="bi-check2-circle"
            color="success"
            linkTo="/requests"
          />

        </div>

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Rejected Requests"
            value={dashboard?.rejectedRequests}
            icon="bi-x-circle"
            color="danger"
            linkTo="/requests"
          />

        </div>

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Damage Reports"
            value={dashboard?.totalDamageReports}
            icon="bi-exclamation-octagon"
            color="danger"
            linkTo="/damage"
          />

        </div>

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Active Assignments"
            value={dashboard?.activeAssignments}
            icon="bi-person-check"
            color="primary"
          />

        </div>

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Returned Assignments"
            value={dashboard?.returnedAssignments}
            icon="bi-arrow-return-left"
            color="secondary"
          />

        </div>

      </div>

      {/* =====================================================
          MY ASSETS
      ===================================================== */}

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white">

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h5 className="mb-1">

                <i className="bi bi-box-seam me-2 text-primary"></i>

                My Assets

              </h5>

              <p className="text-muted mb-0 small">

                Assets currently assigned to you

              </p>

            </div>

            <span className="badge bg-primary">

              {assignedAssets.length}

            </span>

          </div>

        </div>

        <div className="card-body p-0">

          {loadingAssets ? (

            <div className="text-center py-4">

              <div
                className="spinner-border spinner-border-sm"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>

              <span className="ms-2">
                Loading your assets...
              </span>

            </div>

          ) : assignedAssets.length === 0 ? (

            <div className="text-center py-5">

              <i className="bi bi-box fs-1 text-muted"></i>

              <p className="text-muted mt-3 mb-0">

                You currently have no assigned assets.

              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>Assignment ID</th>

                    <th>Asset ID</th>

                    <th>Assigned Date</th>

                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  {assignedAssets.map((assignment) => (

                    <tr key={assignment.id}>

                      <td>

                        #{assignment.id}

                      </td>

                      <td>

                        <Link
                          to={`/assets/${assignment.assetId}`}
                          className="text-decoration-none fw-semibold"
                        >

                          Asset #{assignment.assetId}

                        </Link>

                      </td>

                      <td>

                        {assignment.assignedDate
                          ? new Date(
                              assignment.assignedDate
                            ).toLocaleDateString()
                          : "-"}

                      </td>

                      <td>

                        <span className="badge bg-primary">

                          {assignment.status}

                        </span>

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

export default EmployeeDashboard;