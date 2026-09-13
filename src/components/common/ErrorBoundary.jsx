import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("=== ErrorBoundary ===", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Component crashed
            </h4>

            <p className="fw-bold mb-2">
              {this.state.error?.name}: {this.state.error?.message}
            </p>

            <pre
              style={{
                background: "#fff5f5",
                padding: 12,
                maxHeight: 400,
                overflow: "auto",
                fontSize: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {this.state.error?.stack}
            </pre>

            <button
              className="btn btn-sm btn-outline-danger mt-2"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;