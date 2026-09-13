import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import dashboardApi from "../../services/dashboardApi";

import KpiCard from "../../components/dashboard/KpiCard";

import AssetStatusChart from "../../components/dashboard/AssetStatusChart";

import DamageStatusChart from "../../components/dashboard/DamageStatusChart";

import MaintenanceStatusChart from "../../components/dashboard/MaintenanceStatusChart";

import RepairCostChart from "../../components/dashboard/RepairCostChart";


const AdminDashboard = () => {

  const { email } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  const fetchDashboard = async () => {

    try {

      setLoading(true);

      setError("");

      const data =
        await dashboardApi.getAdminDashboard();

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

    <div className="px-4 py-4">

      {/* ============================================================
          PAGE HEADER
      ============================================================ */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">

        <div>

          <h1 className="page-title mb-1">
            Dashboard
          </h1>

          <p className="page-subtitle mb-0">

            Welcome back,{" "}

            <span className="fw-semibold text-dark">
              {email}
            </span>

          </p>

        </div>


        <div className="d-flex gap-2">

          <button
            className="btn btn-outline-secondary"
            onClick={fetchDashboard}
            disabled={loading}
          >

            <i className="bi bi-arrow-clockwise me-1"></i>

            Refresh

          </button>


          <Link
            to="/reports"
            className="btn btn-primary"
          >

            <i className="bi bi-bar-chart-line me-1"></i>

            Reports

          </Link>

        </div>

      </div>


      {/* ============================================================
          ERROR
      ============================================================ */}

      {error && (

        <div className="alert alert-danger d-flex align-items-center">

          <i className="bi bi-exclamation-triangle-fill me-2"></i>

          {error}

        </div>

      )}


      {/* ============================================================
          KPI CARDS
      ============================================================ */}

      <div className="row g-3 mb-4">

        {/* Total Assets */}

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Total Assets"
            value={dashboard?.totalAssets}
            icon="bi-box-seam"
            color="primary"
            loading={loading}
            linkTo="/assets"
            linkLabel="Manage assets"
          />

        </div>


        {/* Available */}

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


        {/* Assigned */}

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Assigned"
            value={dashboard?.assignedAssets}
            icon="bi-person-check"
            color="info"
            loading={loading}
            linkTo="/assignments"
          />

        </div>


        {/* Damaged */}

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


        {/* In Maintenance */}

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="In Maintenance"
            value={dashboard?.maintenanceAssets}
            icon="bi-tools"
            color="warning"
            loading={loading}
            linkTo="/maintenance"
          />

        </div>


        {/* Retired */}

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Retired"
            value={dashboard?.retiredAssets}
            icon="bi-archive"
            color="secondary"
            loading={loading}
            linkTo="/assets"
          />

        </div>


        {/* Employees */}

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Employees"
            value={dashboard?.totalEmployees}
            icon="bi-people"
            color="primary"
            loading={loading}
            linkTo="/employees"
          />

        </div>


        {/* Pending Requests */}

        <div className="col-sm-6 col-lg-3">

          <KpiCard
            title="Pending Requests"
            value={dashboard?.pendingRequests}
            icon="bi-hourglass-split"
            color="warning"
            loading={loading}
            linkTo="/requests/approved"
          />

        </div>

      </div>


      {/* ============================================================
          CHARTS ROW 1
      ============================================================ */}

      <div className="row g-3 mb-4">

        {/* Asset Distribution */}

        <div className="col-lg-6">

          <div className="card h-100">

            <div className="card-header d-flex justify-content-between align-items-center">

              <div>

                <h5 className="mb-0">
                  Asset Distribution
                </h5>

                <small className="text-muted">
                  Current status breakdown
                </small>

              </div>

              <span className="badge bg-light text-dark">
                Pie
              </span>

            </div>


            <div className="card-body">

              <AssetStatusChart
                dashboard={dashboard}
              />

            </div>

          </div>

        </div>


        {/* Damage Reports */}

        <div className="col-lg-6">

          <div className="card h-100">

            <div className="card-header d-flex justify-content-between align-items-center">

              <div>

                <h5 className="mb-0">
                  Damage Reports by Status
                </h5>

                <small className="text-muted">
                  Reported, reviewed, repairing, resolved
                </small>

              </div>

              <span className="badge bg-light text-dark">
                Bar
              </span>

            </div>


            <div className="card-body">

              <DamageStatusChart
                dashboard={dashboard}
              />

            </div>

          </div>

        </div>

      </div>


      {/* ============================================================
          CHARTS ROW 2
      ============================================================ */}

      <div className="row g-3 mb-4">

        {/* Maintenance Overview */}

        <div className="col-lg-7">

          <div className="card h-100">

            <div className="card-header d-flex justify-content-between align-items-center">

              <div>

                <h5 className="mb-0">
                  Maintenance Overview
                </h5>

                <small className="text-muted">
                  Scheduled, in progress, completed, cancelled
                </small>

              </div>

              <span className="badge bg-light text-dark">
                Bar
              </span>

            </div>


            <div className="card-body">

              <MaintenanceStatusChart
                dashboard={dashboard}
              />

            </div>

          </div>

        </div>


        {/* Cost Summary */}

        <div className="col-lg-5">

          <div className="card h-100">

            <div className="card-header">

              <h5 className="mb-0">
                Cost Summary
              </h5>

              <small className="text-muted">
                Total maintenance spend
              </small>

            </div>


            <div className="card-body d-flex flex-column">

              <RepairCostChart
                dashboard={dashboard}
              />


              <hr />


              {/* Approved / Rejected Requests */}

              <div className="row text-center">

                <div className="col-6">

                  <div className="text-muted small">
                    Approved Requests
                  </div>

                  <div className="fw-bold fs-4 text-success">
                    {dashboard?.approvedRequests ?? 0}
                  </div>

                </div>


                <div className="col-6">

                  <div className="text-muted small">
                    Rejected Requests
                  </div>

                  <div className="fw-bold fs-4 text-danger">
                    {dashboard?.rejectedRequests ?? 0}
                  </div>

                </div>

              </div>


              <hr />


              <Link
                to="/reports"
                className="btn btn-outline-primary w-100 mt-auto"
              >

                <i className="bi bi-file-earmark-bar-graph me-1"></i>

                Open Reports

              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};


export default AdminDashboard;