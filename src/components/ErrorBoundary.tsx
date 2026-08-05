/**
 * Error Boundary Component
 * Catches JavaScript errors in component tree and displays fallback UI
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="glass rounded-3xl p-8 shadow-elegant max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>

              <p className="text-sm text-muted-foreground mb-6">
                We encountered an unexpected error. This has been logged and our
                team will look into it.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-6 rounded-lg border border-border/70 bg-secondary/30 p-4 text-left">
                  <p className="text-xs font-semibold text-foreground mb-2">
                    Error Details:
                  </p>
                  <p className="text-xs text-destructive font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs font-semibold text-foreground cursor-pointer">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs text-muted-foreground font-mono overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01]"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
