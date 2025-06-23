import React from "react";

export function GlobalEmpty({ message = "Nothing here yet." }: { message?: string }) {
  return (
    <div className="p-4 text-gray-500 italic">
      <p>{message}</p>
    </div>
  );
}

export default GlobalEmpty;
