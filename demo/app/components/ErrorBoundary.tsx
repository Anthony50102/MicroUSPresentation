"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center bg-terminal">
          <div className="text-center space-y-4 p-6">
            <p className="font-mono text-lg text-terminal-text">
              Something went wrong.
            </p>
            <p className="font-mono text-sm text-muted">
              {this.state.error?.message}
            </p>
            <button
              onClick={this.handleRetry}
              className="font-mono text-sm px-4 py-2 rounded border border-terminal-accent text-terminal-accent hover:bg-terminal-accent/10 transition-colors"
            >
              Tap to retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
