import { ErrorBoundary } from "react-error-boundary";

import PageError from "@/components/fallbacks/PageError";

interface Props {
  children: React.ReactNode;
}

export const ErrorBoundaryWrapper = ({ children }: Props) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <PageError
          error={error instanceof Error ? error : new Error(String(error))}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
