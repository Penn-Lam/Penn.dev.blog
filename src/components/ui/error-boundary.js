'use client'

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

export function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div
          className="bg-background-full text-text-primary flex h-screen w-full flex-col items-center justify-center"
          role="alert"
        >
          <h2 className="text-title-1-bold">Oops! Something went wrong.</h2>
          <p className="text-body-regular text-text-tertiary mt-2">An unexpected error occurred. Please try again.</p>
          <pre className="bg-background-secondary-default text-body-regular text-text-error-primary mt-4 max-w-2xl overflow-auto rounded-md p-4 whitespace-pre-wrap">
            {error.message}
          </pre>
          <button
            onClick={resetErrorBoundary}
            className="border-border-button-default bg-background-primary-default text-text-primary hover:bg-background-primary-hover focus-visible:ring-border-focus-ring mt-6 rounded-md border px-4 py-2 transition-colors outline-none focus-visible:ring-2"
          >
            Try again
          </button>
        </div>
      )}
    >
      {children}
    </ReactErrorBoundary>
  )
}
