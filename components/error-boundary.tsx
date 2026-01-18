// components/error-boundary.tsx
'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button'; // Assuming a Button component exists
import { Frown } from 'lucide-react'; // Assuming Lucide React is used for icons

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback UI
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  // This lifecycle method is called after an error has been thrown by a descendant component.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  // This lifecycle method is called after an error has been thrown by a descendant component.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    // In a real application, this would send the error to an external logging service like Sentry or Bugsnag.
    // logger.fatal("Client-side error caught by ErrorBoundary", error, { componentStack: errorInfo.componentStack });
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
          <Frown className="h-24 w-24 text-primary mb-6" />
          <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
          <p className="text-lg text-muted-foreground mb-6">
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          {this.state.error && process.env.NODE_ENV === 'development' && (
            <div className="bg-muted p-4 rounded-lg text-left text-sm max-w-lg overflow-auto">
              <h2 className="font-semibold mb-2">Error Details:</h2>
              <p className="font-mono break-all">{this.state.error.message}</p>
              {this.state.error.stack && (
                <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}
          <Button onClick={() => window.location.reload()} className="mt-8">
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
