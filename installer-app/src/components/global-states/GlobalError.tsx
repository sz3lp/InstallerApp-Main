import React from "react";

export function GlobalError({ message = "Something went wrong.", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="p-4 text-red-600 border border-red-300 rounded bg-red-50">
      <p className="mb-2 font-bold">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm underline">
          Retry
        </button>
      )}
    </div>
  );
}

export default GlobalError;
