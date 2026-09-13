const DashboardHeader = ({
  title,
  subtitle,
  email,
  onLogout,
  actions,
}) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
      <div>
        <h1 className="page-title mb-1">{title}</h1>

        <p className="page-subtitle mb-0">
          {subtitle}
          {email && (
            <>
              {" "}
              <span className="fw-semibold text-dark">{email}</span>
            </>
          )}
        </p>
      </div>

      <div className="d-flex gap-2">
        {actions}
      </div>
    </div>
  );
};

export default DashboardHeader;