import React from 'react';
import EmptyState from './EmptyState';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <EmptyState message={this.state.error?.message || 'Something went wrong. Please refresh the page or contact support.'} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
