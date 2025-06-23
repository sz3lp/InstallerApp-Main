import React from "react";

/**
 * Loading indicator displayed while data is fetching.
 *
 * @param message Text shown next to the spinner.
 * @param icon Optional React node rendered before the message.
 */

export function GlobalLoading({
  message = "Loading...",
  icon,
}: {
  message?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-4 text-gray-600 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      <span className="animate-pulse">{message}</span>
    </div>
  );
}

export default GlobalLoading;
