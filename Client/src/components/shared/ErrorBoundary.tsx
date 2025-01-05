import React from "react";
import ErrorPage from "./ErrorPage";

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log("Error caught in Error boundary:", error, errorInfo);
  }
  render(): React.ReactNode {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
