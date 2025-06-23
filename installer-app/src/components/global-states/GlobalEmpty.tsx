import React from "react";

/**
 * Placeholder component shown when there is no data to display.
 *
 * @param message Optional text to explain the empty state.
 * @param icon Optional React node rendered before the message.
 */

export function GlobalEmpty({
  message = "Nothing here yet.",
  icon,
}: {
  message?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-4 text-gray-500 italic flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      <p>{message}</p>
    </div>
  );
}

export default GlobalEmpty;
