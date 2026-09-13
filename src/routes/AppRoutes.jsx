import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";

import AdminDashboard from "../pages/dashboard/AdminDashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";
import EmployeeDashboard from "../pages/dashboard/EmployeeDashboard";
import TechnicianDashboard from "../pages/dashboard/TechnicianDashboard";

import CategoryList from "../pages/categories/CategoryList";
import CategoryDetails from "../pages/categories/CategoryDetails";

import AssetList from "../pages/assets/AssetList";
import AssetDetails from "../pages/assets/AssetDetails";
import MyAssets from "../pages/assets/MyAssets";

import EmployeeList from "../pages/employees/EmployeeList";
import EmployeeDetails from "../pages/employees/EmployeeDetails";

import DepartmentList from "../pages/departments/DepartmentList";
import DepartmentDetails from "../pages/departments/DepartmentDetails";

import MyRequests from "../pages/requests/MyRequests";
import PendingRequests from "../pages/requests/PendingRequests";
import ApprovedRequests from "../pages/requests/ApprovedRequests";
import RequestDetails from "../pages/requests/RequestDetails";

import AssignmentHistory from "../pages/assignments/AssignmentHistory";
import ReturnDetails from "../pages/assignments/ReturnDetails";

import MyDamageReports from "../pages/damages/MyDamageReports";
import DamageReports from "../pages/damages/DamageReports";
import DamageDetails from "../pages/damages/DamageDetails";

import MaintenanceList from "../pages/maintenance/MaintenanceList";
import MaintenanceDetails from "../pages/maintenance/MaintenanceDetails";

import ReportsDashboard from "../pages/reports/ReportsDashboard";
import AssetReport from "../pages/reports/AssetReport";
import RequestReport from "../pages/reports/RequestReport";
import MaintenanceReport from "../pages/reports/MaintenanceReport";
import DamageReport from "../pages/reports/DamageReport";
import AssignmentReport from "../pages/reports/AssignmentReport";

import Profile from "../pages/profile/Profile";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

import { useAuth } from "../context/AuthContext";

// ======================================================
// ROLE-BASED REDIRECT
// ======================================================

const RoleRedirect = () => {
  const { role } = useAuth();

  switch (role) {
    case "ADMIN":
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );

    case "MANAGER":
      return (
        <Navigate
          to="/manager/dashboard"
          replace
        />
      );

    case "EMPLOYEE":
      return (
        <Navigate
          to="/employee/dashboard"
          replace
        />
      );

    case "TECHNICIAN":
      return (
        <Navigate
          to="/technician/dashboard"
          replace
        />
      );

    default:
      return (
        <Navigate
          to="/login"
          replace
        />
      );
  }
};

// ======================================================
// APP ROUTES
// ======================================================

const AppRoutes = () => {
  return (
    <Routes>

      {/* ==================================================
          PUBLIC
      ================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ==================================================
          AUTHENTICATED LAYOUT
          Everything inside here gets the sidebar + topbar
      ================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "ADMIN",
              "MANAGER",
              "EMPLOYEE",
              "TECHNICIAN",
            ]}
          />
        }
      >
        <Route element={<AppLayout />}>

          {/* ---------------- Dashboards ---------------- */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={["MANAGER"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician/dashboard"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Categories ---------------- */}

          <Route
            path="/categories"
            element={<CategoryList />}
          />

          <Route
            path="/categories/:id"
            element={<CategoryDetails />}
          />

          {/* ---------------- Assets ---------------- */}

          <Route
            path="/assets"
            element={<AssetList />}
          />

          <Route
            path="/assets/:id"
            element={<AssetDetails />}
          />

          {/* ---------------- Employee My Assets ---------------- */}

          <Route
            path="/my-assets"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <MyAssets />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Employees ---------------- */}

          <Route
            path="/employees"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <EmployeeList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/:id"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <EmployeeDetails />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Departments ---------------- */}

          <Route
            path="/departments"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <DepartmentList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments/:id"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <DepartmentDetails />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Requests ---------------- */}

          <Route
            path="/requests"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "EMPLOYEE"]}
              >
                <MyRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests/pending"
            element={
              <ProtectedRoute allowedRoles={["MANAGER"]}>
                <PendingRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests/approved"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ApprovedRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests/:id"
            element={<RequestDetails />}
          />

          {/* ---------------- Assignments ---------------- */}

          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AssignmentHistory />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Admin Return / Assignment Details ---------------- */}

          <Route
            path="/admin/assignments/:assignmentId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ReturnDetails />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Damage ---------------- */}

          <Route
            path="/damage"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <MyDamageReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/damage/all"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "TECHNICIAN"]}
              >
                <DamageReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/damage/:id"
            element={<DamageDetails />}
          />

          {/* ---------------- Maintenance ---------------- */}

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "TECHNICIAN"]}
              >
                <MaintenanceList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/:id"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "TECHNICIAN"]}
              >
                <MaintenanceDetails />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Reports ---------------- */}

          <Route
            path="/reports"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <ReportsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/assets"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <AssetReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/requests"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <RequestReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/maintenance"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <MaintenanceReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/damage"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <DamageReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/assignments"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "MANAGER"]}
              >
                <AssignmentReport />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Profile ---------------- */}

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>
      </Route>

      {/* ==================================================
          ROOT REDIRECTS
      ================================================== */}

      <Route
        path="/dashboard"
        element={<RoleRedirect />}
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRoutes;