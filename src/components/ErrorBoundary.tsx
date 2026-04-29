import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  name?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage:
        error instanceof Error ? error.message : "Erro inesperado na rota.",
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.debug("[ErrorBoundary]", this.props.name ?? "Route", {
        error,
        stack: errorInfo.componentStack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-lg border bg-card p-4 space-y-2">
            <h2 className="text-base font-semibold">Erro ao carregar rota</h2>
            <p className="text-sm text-muted-foreground">
              {this.props.name ?? "Componente"}
            </p>
            {import.meta.env.DEV ? (
              <pre className="text-xs whitespace-pre-wrap break-words rounded bg-muted p-3">
                {this.state.errorMessage}
              </pre>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
