import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>⚠️ Something went wrong</h2>
            <p>The application encountered an unexpected error.</p>
            <details className="error-details">
              <summary>Error details (for debugging)</summary>
              <pre>{this.state.error && this.state.error.toString()}</pre>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="btn-reload"
            >
              Reload Page
            </button>
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
              padding: 20px;
            }

            .error-container {
              background: white;
              border-radius: 8px;
              padding: 40px;
              max-width: 600px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }

            .error-container h2 {
              color: #d32f2f;
              margin: 0 0 10px;
              font-size: 24px;
            }

            .error-container p {
              color: #666;
              margin: 0 0 20px;
              line-height: 1.6;
            }

            .error-details {
              background: #f5f5f5;
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 12px;
              margin: 20px 0;
              text-align: left;
            }

            .error-details summary {
              cursor: pointer;
              color: #1976d2;
              font-weight: 600;
              user-select: none;
            }

            .error-details pre {
              background: #fff;
              border: 1px solid #eee;
              border-radius: 4px;
              padding: 10px;
              margin: 10px 0 0;
              overflow-x: auto;
              font-size: 12px;
              color: #333;
            }

            .btn-reload {
              background: #1976d2;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 4px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            }

            .btn-reload:hover {
              background: #1565c0;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
