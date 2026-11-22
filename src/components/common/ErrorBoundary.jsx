import { Component } from "react";

/**
 * Catches render errors so one broken component does not blank the whole app.
 * Give it a `resetKey` (e.g. the current path): when the key changes, the
 * boundary resets, so navigating away from a crashed page works again.
 * Technical details are shown only in development.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="container py-5" role="alert">
        <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 560 }}>
          <div className="card-body p-4 text-center">
            <i className="bi bi-exclamation-triangle text-warning fs-1" aria-hidden="true"></i>
            <h4 className="mt-3">Something went wrong on this page</h4>
            <p className="text-muted mb-4">
              The rest of the app still works. Try going back, or reload the page.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>
                <i className="bi bi-arrow-left me-1"></i> Go back
              </button>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                <i className="bi bi-arrow-clockwise me-1"></i> Reload
              </button>
            </div>

            {import.meta.env.DEV && (
              <pre className="text-start small bg-light border rounded p-3 mt-4 mb-0"
                   style={{ maxHeight: 300, overflow: "auto", whiteSpace: "pre-wrap" }}>
                {error.name}: {error.message}
                {"\n"}
                {error.stack}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
