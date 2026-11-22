import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import PageLoader from "../components/common/PageLoader";
import { useAuth } from "../context/AuthContext";

// Every page is loaded on demand, so the login page does not download
// charts, PDF and Excel libraries.
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

const AdminDashboard = lazy(() => import("../pages/dashboard/AdminDashboard"));
const ManagerDashboard = lazy(() => import("../pages/dashboard/ManagerDashboard"));
const EmployeeDashboard = lazy(() => import("../pages/dashboard/EmployeeDashboard"));
const TechnicianDashboard = lazy(() => import("../pages/dashboard/TechnicianDashboard"));

const CategoryList = lazy(() => import("../pages/categories/CategoryList"));
const CategoryDetails = lazy(() => import("../pages/categories/CategoryDetails"));
const AssetList = lazy(() => import("../pages/assets/AssetList"));
const AssetDetails = lazy(() => import("../pages/assets/AssetDetails"));
const MyAssets = lazy(() => import("../pages/assets/MyAssets"));
const AssetScan = lazy(() => import("../pages/scan/AssetScan"));
const Scanner = lazy(() => import("../pages/scan/Scanner"));

const EmployeeList = lazy(() => import("../pages/employees/EmployeeList"));
const EmployeeDetails = lazy(() => import("../pages/employees/EmployeeDetails"));
const DepartmentList = lazy(() => import("../pages/departments/DepartmentList"));
const DepartmentDetails = lazy(() => import("../pages/departments/DepartmentDetails"));

const MyRequests = lazy(() => import("../pages/requests/MyRequests"));
const PendingRequests = lazy(() => import("../pages/requests/PendingRequests"));
const ApprovedRequests = lazy(() => import("../pages/requests/ApprovedRequests"));
const RequestDetails = lazy(() => import("../pages/requests/RequestDetails"));
const AssignmentHistory = lazy(() => import("../pages/assignments/AssignmentHistory"));
const ReturnDetails = lazy(() => import("../pages/assignments/ReturnDetails"));

const MyDamageReports = lazy(() => import("../pages/damages/MyDamageReports"));
const DamageReports = lazy(() => import("../pages/damages/DamageReports"));
const DamageDetails = lazy(() => import("../pages/damages/DamageDetails"));
const MaintenanceList = lazy(() => import("../pages/maintenance/MaintenanceList"));
const MaintenanceDetails = lazy(() => import("../pages/maintenance/MaintenanceDetails"));
const MyJobs = lazy(() => import("../pages/maintenance/MyJobs"));

const ReportsDashboard = lazy(() => import("../pages/reports/ReportsDashboard"));
const AssetReport = lazy(() => import("../pages/reports/AssetReport"));
const RequestReport = lazy(() => import("../pages/reports/RequestReport"));
const MaintenanceReport = lazy(() => import("../pages/reports/MaintenanceReport"));
const DamageReport = lazy(() => import("../pages/reports/DamageReport"));
const AssignmentReport = lazy(() => import("../pages/reports/AssignmentReport"));
const Insights = lazy(() => import("../pages/insights/Insights"));

const UserList = lazy(() => import("../pages/users/UserList"));
const AuditList = lazy(() => import("../pages/audits/AuditList"));
const AuditDetails = lazy(() => import("../pages/audits/AuditDetails"));
const AuditLog = lazy(() => import("../pages/audits/AuditLog"));
const Notifications = lazy(() => import("../pages/notifications/Notifications"));
const Profile = lazy(() => import("../pages/profile/Profile"));

const ALL = ["ADMIN", "MANAGER", "EMPLOYEE", "TECHNICIAN"];
const ADMIN = ["ADMIN"];
const ADMIN_MANAGER = ["ADMIN", "MANAGER"];
const ADMIN_TECH = ["ADMIN", "TECHNICIAN"];
const STAFF = ["ADMIN", "MANAGER", "TECHNICIAN"];
const EMPLOYEE = ["EMPLOYEE"];

const DASHBOARDS = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  EMPLOYEE: "/employee/dashboard",
  TECHNICIAN: "/technician/dashboard",
};

const RoleRedirect = () => {
  const { role } = useAuth();
  return <Navigate to={DASHBOARDS[role] || "/login"} replace />;
};

/** Small helper so every route declares its roles in one line. */
const guard = (roles, element) => <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>;

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ---------- public ---------- */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ---------- logged in ---------- */}
      <Route element={<ProtectedRoute allowedRoles={ALL} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<RoleRedirect />} />
          <Route path="/admin/dashboard" element={guard(ADMIN, <AdminDashboard />)} />
          <Route path="/manager/dashboard" element={guard(["MANAGER"], <ManagerDashboard />)} />
          <Route path="/employee/dashboard" element={guard(EMPLOYEE, <EmployeeDashboard />)} />
          <Route path="/technician/dashboard" element={guard(["TECHNICIAN"], <TechnicianDashboard />)} />

          {/* assets */}
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/:id" element={<CategoryDetails />} />
          <Route path="/assets" element={<AssetList />} />
          <Route path="/assets/:id" element={<AssetDetails />} />
          <Route path="/my-assets" element={guard(EMPLOYEE, <MyAssets />)} />
          <Route path="/a/:assetCode" element={<AssetScan />} />
          <Route path="/scan" element={<Scanner />} />

          {/* organisation */}
          <Route path="/employees" element={guard(ADMIN_MANAGER, <EmployeeList />)} />
          <Route path="/employees/:id" element={guard(ADMIN_MANAGER, <EmployeeDetails />)} />
          <Route path="/departments" element={guard(ADMIN_MANAGER, <DepartmentList />)} />
          <Route path="/departments/:id" element={guard(ADMIN_MANAGER, <DepartmentDetails />)} />
          <Route path="/users" element={guard(ADMIN, <UserList />)} />

          {/* requests and assignments */}
          <Route path="/requests" element={guard(EMPLOYEE, <MyRequests />)} />
          <Route path="/requests/pending" element={guard(["MANAGER", "ADMIN"], <PendingRequests />)} />
          <Route path="/requests/approved" element={guard(ADMIN, <ApprovedRequests />)} />
          <Route path="/requests/:id" element={guard(["ADMIN", "MANAGER", "EMPLOYEE"], <RequestDetails />)} />
          <Route path="/assignments" element={guard(ADMIN_MANAGER, <AssignmentHistory />)} />
          <Route path="/admin/assignments/:assignmentId" element={guard(ADMIN, <ReturnDetails />)} />

          {/* damage and maintenance */}
          <Route path="/damage" element={guard(EMPLOYEE, <MyDamageReports />)} />
          <Route path="/damage/all" element={guard(STAFF, <DamageReports />)} />
          <Route path="/damage/:id" element={<DamageDetails />} />
          <Route path="/maintenance" element={guard(ADMIN_TECH, <MaintenanceList />)} />
          <Route path="/maintenance/my" element={guard(["TECHNICIAN"], <MyJobs />)} />
          <Route path="/maintenance/:id" element={guard(ADMIN_TECH, <MaintenanceDetails />)} />

          {/* reports and insights */}
          <Route path="/reports" element={guard(ADMIN_MANAGER, <ReportsDashboard />)} />
          <Route path="/reports/assets" element={guard(ADMIN_MANAGER, <AssetReport />)} />
          <Route path="/reports/requests" element={guard(ADMIN_MANAGER, <RequestReport />)} />
          <Route path="/reports/maintenance" element={guard(ADMIN_MANAGER, <MaintenanceReport />)} />
          <Route path="/reports/damage" element={guard(ADMIN_MANAGER, <DamageReport />)} />
          <Route path="/reports/assignments" element={guard(ADMIN_MANAGER, <AssignmentReport />)} />
          <Route path="/insights" element={guard(ADMIN_MANAGER, <Insights />)} />

          {/* stock-take audits */}
          <Route path="/audits" element={guard(ADMIN_TECH, <AuditList />)} />
          <Route path="/audits/:id" element={guard(ADMIN_TECH, <AuditDetails />)} />
          <Route path="/audit-log" element={guard(ADMIN, <AuditLog />)} />

          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
