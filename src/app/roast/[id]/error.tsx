"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

function RoastError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const isNotFound =
    error.message.includes("NOT_FOUND") || error.message.includes("not found");

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-10">
      <span className="font-mono text-6xl text-accent-red">
        {isNotFound ? "?" : "x"}
      </span>

      <div className="flex flex-col items-center gap-2">
        <h1 className="font-mono text-xl font-bold text-text-primary">
          {isNotFound ? "roast_not_found" : "roast_crashed"}
        </h1>
        <p className="font-mono text-sm text-text-secondary text-center max-w-md">
          {isNotFound
            ? "// esse roast não existe. ou foi tão ruim que a IA apagou da memória."
            : "// o servidor tropeçou tentando carregar esse roast. acontece."}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {!isNotFound && (
          <button
            type="button"
            onClick={reset}
            className="font-mono text-sm text-accent-green hover:underline"
          >
            {"$ retry"}
          </button>
        )}

        <Link
          href="/"
          className="font-mono text-sm text-text-secondary hover:text-text-primary hover:underline"
        >
          {"$ cd ~"}
        </Link>
      </div>
    </main>
  );
}

export default RoastError;
