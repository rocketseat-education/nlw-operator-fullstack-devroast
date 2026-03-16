"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-10">
          <span className="font-mono text-6xl text-accent-red">{"x"}</span>

          <div className="flex flex-col items-center gap-2">
            <h1 className="font-mono text-xl font-bold text-text-primary">
              fatal_error
            </h1>
            <p className="font-mono text-sm text-text-secondary text-center max-w-md">
              {
                "// algo quebrou feio. nem o roast mode conseguiria zoar esse bug."
              }
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="font-mono text-sm text-accent-green hover:underline"
          >
            {"$ try_again"}
          </button>
        </main>
      </body>
    </html>
  );
}

export default GlobalError;
