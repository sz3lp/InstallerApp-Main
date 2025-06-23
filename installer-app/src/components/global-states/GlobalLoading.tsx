import React from "react";

export function GlobalLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="p-4 text-gray-600">
      <span className="animate-pulse">{message}</span>
    </div>
  );
}

export default GlobalLoading;
