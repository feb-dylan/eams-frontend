import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import dashboardApi from "../../services/dashboardApi";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import KpiCard from "../../components/dashboard/KpiCard";
import AssetStatusChart from "../../components/dashboard/AssetStatusChart";
import DamageStatusChart from "../../components/dashboard/DamageStatusChart";

const ManagerDashboard = () => {
  const { email, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await dashboardApi.getManagerDashboard();
      setDashboard(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="container-fluid px-4 py-4">
      <DashboardHeader
        title="Manager Dashboard"
        subtitle="Welcome back,"
        email={email}
        onLogout={logout}
        actions={
          <>
            <Link
              to="/requests/pending"
              className="btn btn-primary"
            >
              <i className="bi bi-inbox me-1"></i>
              Review Pending Requests
            </Link>

            <button
              className="btn btn-outline-secondary"
              onClick={fetchDashboard}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </>
        }
      />

      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Total Employees"
            value={dashboard?.totalEmployees}
            icon="bi-people"
            color="primary"
            loading={loading}
            linkTo="/employees"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Total Assets"
            value={dashboard?.totalAssets}
            icon="bi-box-seam"
            color="info"
            loading={loading}
            linkTo="/assets"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Assigned"
            value={dashboard?.assignedAssets}
            icon="bi-person-check"
            color="success"
            loading={loading}
            linkTo="/assets"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Available"
            value={dashboard?.availableAssets}
            icon="bi-check-circle"
            color="success"
            loading={loading}
            linkTo="/assets"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Damaged"
            value={dashboard?.damagedAssets}
            icon="bi-exclamation-octagon"
            color="danger"
            loading={loading}
            linkTo="/damage/all"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="In Maintenance"
            value={dashboard?.maintenanceAssets}
            icon="bi-tools"
            color="warning"
            loading={loading}
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Pending Requests"
            value={dashboard?.pendingRequests}
            icon="bi-hourglass-split"
            color="warning"
            loading={loading}
            linkTo="/requests/pending"
            linkLabel="Review now"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Approved Requests"
            value={dashboard?.approvedRequests}
            icon="bi-check2-circle"
            color="success"
            loading={loading}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                <i className="bi bi-pie-chart me-2 text-primary"></i>
                Asset Distribution
              </h5>
            </div>

            <div className="card-body">
              <AssetStatusChart dashboard={dashboard} />
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2 text-danger"></i>
                Damage Reports
              </h5>
            </div>

            <div className="card-body">
              <DamageStatusChart dashboard={dashboard} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;