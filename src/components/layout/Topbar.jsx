import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PATH_LABELS = {
  dashboard: "Dashboard",
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
  technician: "Technician",
  assets: "Assets",
  categories: "Categories",
  employees: "Employees",
  departments: "Departments",
  requests: "Requests",
  pending: "Pending",
  approved: "Approved",
  assignments: "Assignments",
  damage: "Damage Reports",
  all: "All",
  maintenance: "Maintenance",
  reports: "Reports",
  profile: "My Profile",
};

const Topbar = ({ onToggleSidebar }) => {
  const { email, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  // Build breadcrumb from URL
  const segments = location.pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => PATH_LABELS[seg] || seg);

  const roleBadgeClass = {
    ADMIN: "bg-dark text-white",
    MANAGER: "bg-primary text-white",
    TECHNICIAN: "bg-warning text-dark",
    EMPLOYEE: "bg-success text-white",
  }[role] || "bg-secondary text-white";

  return (
    <header className="app-topbar d-flex align-items-center">
      {/* Mobile Sidebar Button */}
      <button
        className="btn btn-sm topbar-icon-btn me-3 d-lg-none"
        onClick={onToggleSidebar}
        aria-label="Open sidebar"
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Breadcrumb */}
      <div className="topbar-breadcrumb d-none d-md-flex align-items-center">
        <span>Home</span>

        {segments.length > 0 && (
          <>
            <i className="bi bi-chevron-right mx-2 small"></i>

            <span className="crumb-current">
              {segments[segments.length - 1]}
            </span>
          </>
        )}
      </div>

      {/* Right Side */}
      <div className="ms-auto d-flex align-items-center">
        {/* User Menu */}
        <div className="position-relative">
          <button
            className="btn btn-sm btn-light border d-flex align-items-center gap-2"
            onClick={() => setMenuOpen((v) => !v)}
            style={{ borderRadius: "8px" }}
          >
            {/* Role Badge */}
            <span
              className={`badge topbar-role-badge ${roleBadgeClass}`}
            >
              {role}
            </span>

            {/* Email */}
            <span
              className="d-none d-sm-inline text-muted"
              style={{ fontSize: "0.85rem" }}
            >
              {email}
            </span>

            <i className="bi bi-chevron-down small text-muted"></i>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              {/* Overlay */}
              <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{ zIndex: 1000 }}
                onClick={() => setMenuOpen(false)}
              ></div>

              {/* Dropdown */}
              <div
                className="position-absolute bg-white border rounded-3 shadow-sm py-2"
                style={{
                  top: "calc(100% + 6px)",
                  right: 0,
                  minWidth: "200px",
                  zIndex: 1001,
                }}
              >
                {/* User Information */}
                <div className="px-3 py-2">
                  <div className="fw-semibold">
                    {role}
                  </div>

                  <div
                    className="text-muted"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {email}
                  </div>
                </div>

                <hr className="my-1" />

                {/* Logout */}
                <button
                  className="dropdown-item d-flex align-items-center px-3 py-2 text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;