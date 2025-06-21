import React from "react";

export type SZTableProps = {
  headers: string[];
  children: React.ReactNode;
  className?: string;
};

export const SZTable: React.FC<SZTableProps> = ({
  headers,
  children,
  className = "",
}) => {
  return (
    <table className={`min-w-full text-sm border ${className}`.trim()}>
      <thead>
        <tr className="bg-gray-50">
          {headers.map((h) => (
            <th key={h} className="p-2 border">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};
