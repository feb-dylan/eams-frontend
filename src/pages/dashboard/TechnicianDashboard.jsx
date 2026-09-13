import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import dashboardApi from "../../services/dashboardApi";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import KpiCard from "../../components/dashboard/KpiCard";
import DamageStatusChart from "../../components/dashboard/DamageStatusChart";
import MaintenanceStatusChart from "../../components/dashboard/MaintenanceStatusChart";
import RepairCostChart from "../../components/dashboard/RepairCostChart";

const TechnicianDashboard = () => {
  const { email, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await dashboardApi.getTechnicianDashboard();
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
        title="Technician Dashboard"
        subtitle="Welcome back,"
        email={email}
        onLogout={logout}
        actions={
          <>
            <Link to="/damage/all" className="btn btn-outline-danger">
              <i className="bi bi-exclamation-triangle me-1"></i>
              Damage Reports
            </Link>

            <Link to="/maintenance" className="btn btn-primary">
              <i className="bi bi-tools me-1"></i>
              Maintenance
            </Link>

            <button
              className="btn btn-outline-secondary"
              onClick={fetchDashboard}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>
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

      {/* Damage KPIs */}
      <h6 className="text-muted text-uppercase fw-semibold mt-2 mb-3">
        <i className="bi bi-exclamation-octagon me-1"></i>
        Damage Reports
      </h6>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Total Reports"
            value={dashboard?.totalDamageReports}
            icon="bi-file-earmark-text"
            color="primary"
            linkTo="/damage/all"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Reported"
            value={dashboard?.reportedDamage}
            icon="bi-exclamation-circle"
            color="danger"
            linkTo="/damage/all"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Under Review"
            value={dashboard?.underReviewDamage}
            icon="bi-search"
            color="warning"
            linkTo="/damage/all"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Resolved"
            value={dashboard?.resolvedDamage}
            icon="bi-check2-circle"
            color="success"
            linkTo="/damage/all"
          />
        </div>
      </div>

      {/* Maintenance KPIs */}
      <h6 className="text-muted text-uppercase fw-semibold mb-3">
        <i className="bi bi-tools me-1"></i>
        Maintenance
      </h6>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Total Maintenance"
            value={dashboard?.totalMaintenance}
            icon="bi-clipboard-check"
            color="primary"
            linkTo="/maintenance"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Scheduled"
            value={dashboard?.scheduledMaintenance}
            icon="bi-calendar-event"
            color="warning"
            linkTo="/maintenance"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="In Progress"
            value={dashboard?.inProgressMaintenance}
            icon="bi-hourglass-split"
            color="info"
            linkTo="/maintenance"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <KpiCard
            title="Completed"
            value={dashboard?.completedMaintenance}
            icon="bi-check2-all"
            color="success"
            linkTo="/maintenance"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2 text-danger"></i>
                Damage by Status
              </h5>
            </div>

            <div className="card-body">
              <DamageStatusChart dashboard={dashboard} />
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2 text-warning"></i>
                Maintenance by Status
              </h5>
            </div>

            <div className="card-body">
              <MaintenanceStatusChart dashboard={dashboard} />
            </div>
          </div>
        </div>
      </div>

      {/* Cost + Assets summary */}
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                <i className="bi bi-cash-coin me-2 text-success"></i>
                Repair Cost
              </h5>
            </div>

            <div className="card-body">
              <RepairCostChart dashboard={dashboard} />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <KpiCard
            title="Assets in Maintenance"
            value={dashboard?.maintenanceAssets}
            icon="bi-tools"
            color="warning"
            linkTo="/maintenance"
          />
        </div>

        <div className="col-lg-4">
          <KpiCard
            title="Damaged Assets"
            value={dashboard?.damagedAssets}
            icon="bi-exclamation-octagon"
            color="danger"
            linkTo="/damage/all"
          />
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;