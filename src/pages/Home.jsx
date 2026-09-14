import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-vh-100 bg-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="navbar navbar-expand-lg bg-white border-bottom">

        <div className="container py-2">

          {/* Brand */}

          <Link
            to="/"
            className="navbar-brand d-flex align-items-center"
          >

            <div
              className="d-flex align-items-center justify-content-center rounded-3 me-2"
              style={{
                width: "42px",
                height: "42px",
                background: "#0d6efd",
                color: "white",
              }}
            >
              <i className="bi bi-box-seam-fill"></i>
            </div>

            <div>
              <div className="fw-bold">
                EAMS
              </div>

              <small className="text-muted">
                Asset Management
              </small>
            </div>

          </Link>

          {/* Right buttons */}

          <div className="d-flex gap-2">

            <Link
              to="/login"
              className="btn btn-outline-primary"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="btn btn-primary"
            >
              Register
            </Link>

          </div>

        </div>

      </nav>


      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg, #f5f9ff 0%, #ffffff 100%)",
        }}
      >

        <div className="container py-5">

          <div className="row align-items-center g-5">

            {/* Left */}

            <div className="col-lg-7">

              <span className="badge bg-primary-subtle text-primary px-3 py-2 mb-3">
                Enterprise Asset Management System
              </span>

              <h1
                className="display-4 fw-bold mb-4"
                style={{
                  lineHeight: "1.15",
                }}
              >
                Manage Your Assets
                <br />

                <span className="text-primary">
                  Smarter &amp; Simpler
                </span>
              </h1>

              <p
                className="lead text-muted mb-4"
                style={{
                  maxWidth: "650px",
                }}
              >
                EAMS helps organizations manage assets,
                employee requests, assignments, damage reports,
                maintenance, and operational information
                in one centralized system.
              </p>

              <div className="d-flex flex-wrap gap-3">

                <Link
                  to="/register"
                  className="btn btn-primary btn-lg px-4"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Get Started
                </Link>

                <Link
                  to="/login"
                  className="btn btn-outline-dark btn-lg px-4"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </Link>

              </div>

            </div>


            {/* Right */}

            <div className="col-lg-5">

              <div
                className="card border-0 shadow-lg rounded-4"
              >

                <div className="card-body p-4">

                  <div className="d-flex align-items-center mb-4">

                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        background: "#e7f1ff",
                        color: "#0d6efd",
                      }}
                    >
                      <i className="bi bi-speedometer2 fs-4"></i>
                    </div>

                    <div>
                      <h5 className="mb-1 fw-bold">
                        EAMS Dashboard
                      </h5>

                      <small className="text-muted">
                        Centralized asset management
                      </small>
                    </div>

                  </div>


                  {/* Fake dashboard statistics */}

                  <div className="row g-3">

                    <div className="col-6">

                      <div className="bg-light rounded-3 p-3">

                        <i className="bi bi-box-seam text-primary fs-4"></i>

                        <div className="fw-bold fs-4 mt-2">
                          Assets
                        </div>

                        <small className="text-muted">
                          Track inventory
                        </small>

                      </div>

                    </div>


                    <div className="col-6">

                      <div className="bg-light rounded-3 p-3">

                        <i className="bi bi-people text-success fs-4"></i>

                        <div className="fw-bold fs-4 mt-2">
                          Employees
                        </div>

                        <small className="text-muted">
                          Manage users
                        </small>

                      </div>

                    </div>


                    <div className="col-6">

                      <div className="bg-light rounded-3 p-3">

                        <i className="bi bi-tools text-warning fs-4"></i>

                        <div className="fw-bold fs-4 mt-2">
                          Maintenance
                        </div>

                        <small className="text-muted">
                          Track repairs
                        </small>

                      </div>

                    </div>


                    <div className="col-6">

                      <div className="bg-light rounded-3 p-3">

                        <i className="bi bi-bar-chart-line text-info fs-4"></i>

                        <div className="fw-bold fs-4 mt-2">
                          Reports
                        </div>

                        <small className="text-muted">
                          Analyze data
                        </small>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section className="py-5">

        <div className="container py-4">

          <div className="text-center mb-5">

            <span className="text-primary fw-semibold">
              FEATURES
            </span>

            <h2 className="fw-bold mt-2">
              Everything You Need to Manage Assets
            </h2>

            <p className="text-muted mx-auto" style={{ maxWidth: "650px" }}>
              EAMS provides a complete workflow for managing
              organizational assets from assignment to maintenance.
            </p>

          </div>


          <div className="row g-4">

            {/* Feature 1 */}

            <div className="col-md-6 col-lg-3">

              <div className="card h-100 border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      background: "#e7f1ff",
                      color: "#0d6efd",
                    }}
                  >
                    <i className="bi bi-box-seam fs-4"></i>
                  </div>

                  <h5 className="fw-bold">
                    Asset Management
                  </h5>

                  <p className="text-muted mb-0">
                    Manage assets, categories, locations,
                    status, and asset information from one place.
                  </p>

                </div>

              </div>

            </div>


            {/* Feature 2 */}

            <div className="col-md-6 col-lg-3">

              <div className="card h-100 border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      background: "#e8f7ee",
                      color: "#198754",
                    }}
                  >
                    <i className="bi bi-person-check fs-4"></i>
                  </div>

                  <h5 className="fw-bold">
                    Asset Requests
                  </h5>

                  <p className="text-muted mb-0">
                    Employees can request assets while managers
                    and administrators handle approval and assignment.
                  </p>

                </div>

              </div>

            </div>


            {/* Feature 3 */}

            <div className="col-md-6 col-lg-3">

              <div className="card h-100 border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      background: "#fff4df",
                      color: "#f59f00",
                    }}
                  >
                    <i className="bi bi-exclamation-octagon fs-4"></i>
                  </div>

                  <h5 className="fw-bold">
                    Damage Tracking
                  </h5>

                  <p className="text-muted mb-0">
                    Employees can report damaged assets and
                    technicians can manage the repair workflow.
                  </p>

                </div>

              </div>

            </div>


            {/* Feature 4 */}

            <div className="col-md-6 col-lg-3">

              <div className="card h-100 border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      background: "#f0eaff",
                      color: "#6f42c1",
                    }}
                  >
                    <i className="bi bi-tools fs-4"></i>
                  </div>

                  <h5 className="fw-bold">
                    Maintenance
                  </h5>

                  <p className="text-muted mb-0">
                    Track repairs, maintenance status, costs,
                    technicians, and completion information.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CALL TO ACTION
      ====================================================== */}

      <section className="py-5 bg-light">

        <div className="container py-4">

          <div className="text-center">

            <h2 className="fw-bold mb-3">
              Ready to get started?
            </h2>

            <p className="text-muted mb-4">
              Create your EAMS account and start managing
              your organization's assets.
            </p>

            <Link
              to="/register"
              className="btn btn-primary btn-lg px-4"
            >
              Create Account
              <i className="bi bi-arrow-right ms-2"></i>
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-top bg-white">

        <div className="container py-4">

          <div className="row align-items-center">

            <div className="col-md-6">

              <div className="d-flex align-items-center">

                <i className="bi bi-box-seam-fill text-primary me-2"></i>

                <span className="fw-bold">
                  EAMS
                </span>

              </div>

              <small className="text-muted">
                Enterprise Asset Management System
              </small>

            </div>

            <div className="col-md-6 text-md-end mt-3 mt-md-0">

              <small className="text-muted">
                EAMS v1.0
              </small>

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default Home;