import React from "react";

/**
 * Generic error message component.
 *
 * @param message Text to display to the user.
 * @param onRetry Optional callback to retry the failed action.
 * @param icon Optional React node rendered before the message.
 */

export function GlobalError({
  message = "Something went wrong.",
  onRetry,
  icon,
}: {
  message?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-4 text-red-600 border border-red-300 rounded bg-red-50 flex items-start">
      {icon && <span className="mr-2">{icon}</span>}
      <div>
        <p className="mb-2 font-bold">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-sm underline">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default GlobalError;
