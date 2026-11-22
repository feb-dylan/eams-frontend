import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ErrorBoundary from "../common/ErrorBoundary";
import PageLoader from "../common/PageLoader";
import AskEamsDrawer from "../ai/AskEamsDrawer";
import { useAuth } from "../../context/AuthContext";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { role } = useAuth();

  return (
    <div className="app-shell d-flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content flex-grow-1 d-flex flex-column">
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

        <main className="app-main flex-grow-1">
          {/* resetKey: a crash on one page no longer breaks every other page */}
          <ErrorBoundary resetKey={location.pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {(role === "ADMIN" || role === "MANAGER") && <AskEamsDrawer />}
    </div>
  );
};

export default AppLayout;
