import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_SECTIONS = [
  {
    title: "Main",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: "bi-grid-1x2",
        roles: ["ADMIN", "MANAGER", "EMPLOYEE", "TECHNICIAN"],
      },
    ],
  },
  {
    title: "Assets",
    items: [
      {
        to: "/assets",
        label: "Assets",
        icon: "bi-box-seam",
        roles: ["ADMIN", "MANAGER", "EMPLOYEE", "TECHNICIAN"],
      },
      {
        to: "/categories",
        label: "Categories",
        icon: "bi-tags",
        roles: ["ADMIN", "MANAGER", "EMPLOYEE", "TECHNICIAN"],
      },
      {
        to: "/assignments",
        label: "Assignments",
        icon: "bi-person-check",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Workflow",
    items: [
      {
        to: "/requests",
        label: "My Requests",
        icon: "bi-file-earmark-text",
        roles: ["EMPLOYEE"],
      },
      {
        to: "/my-assets",
        label: "My Assets",
        icon: "bi-pc-display",
        roles: ["EMPLOYEE"],
      },
      {
        to: "/requests/pending",
        label: "Pending Requests",
        icon: "bi-inbox",
        roles: ["MANAGER"],
      },
      {
        to: "/requests/approved",
        label: "Approved Requests",
        icon: "bi-check2-circle",
        roles: ["ADMIN"],
      },
      {
        to: "/damage",
        label: "My Damage Reports",
        icon: "bi-exclamation-octagon",
        roles: ["EMPLOYEE"],
      },
      {
        to: "/damage/all",
        label: "Damage Reports",
        icon: "bi-exclamation-octagon",
        roles: ["ADMIN", "TECHNICIAN"],
      },
      {
        to: "/maintenance",
        label: "Maintenance",
        icon: "bi-tools",
        roles: ["ADMIN", "TECHNICIAN"],
      },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        to: "/employees",
        label: "Employees",
        icon: "bi-people",
        roles: ["ADMIN", "MANAGER"],
      },
      {
        to: "/departments",
        label: "Departments",
        icon: "bi-building",
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        to: "/reports",
        label: "Reports",
        icon: "bi-bar-chart-line",
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        to: "/profile",
        label: "My Profile",
        icon: "bi-person",
        roles: ["ADMIN", "MANAGER", "EMPLOYEE", "TECHNICIAN"],
      },
    ],
  },
];

const Sidebar = ({ open, onClose }) => {
  const { role } = useAuth();

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.roles.includes(role)
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      {open && (
        <div
          className="sidebar-backdrop d-lg-none"
          onClick={onClose}
        ></div>
      )}

      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <i className="bi bi-box-seam-fill"></i>
          </div>

          <div className="flex-grow-1">
            <div className="brand-name">EAMS</div>
            <div className="brand-tag">Asset Management</div>
          </div>

          <button
            className="btn btn-sm text-muted d-lg-none"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <div className="sidebar-section-title">
                {section.title}
              </div>

              <ul className="nav flex-column">
                {section.items.map((item) => (
                  <li key={item.to} className="nav-item">
                    <NavLink
                      to={item.to}
                      end={item.to === "/dashboard"}
                      className={({ isActive }) =>
                        `nav-link d-flex align-items-center ${
                          isActive ? "active" : ""
                        }`
                      }
                      onClick={onClose}
                    >
                      <i className={`bi ${item.icon} me-2`}></i>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <i className="bi bi-info-circle me-1"></i>
          EAMS v1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;