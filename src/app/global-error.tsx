'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex h-screen w-full flex-col items-center justify-center bg-white px-4 text-center font-sans text-black">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="mt-2 text-gray-500">A critical error occurred. Please refresh the page.</p>
        <button
          className="mt-6 rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
          onClick={() => reset()}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
