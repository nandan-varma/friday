"use client";

import { ErrorDisplay } from "@/components/error-display";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ErrorDisplay error={error} reset={reset} />
      </body>
    </html>
  );
}
