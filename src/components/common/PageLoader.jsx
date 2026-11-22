const PageLoader = ({ text = "Loading..." }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted" role="status">
    <div className="spinner-border text-primary" aria-hidden="true"></div>
    <span className="mt-2">{text}</span>
  </div>
);

export default PageLoader;
