'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        Something went wrong!
      </h2>
      <p className="mt-2 text-muted-foreground max-w-[500px]">
        {error.message || 'An unexpected error occurred. Please try again later.'}
      </p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 max-w-2xl overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground">
          {error.stack}
        </pre>
      )}
    </div>
  );
}
