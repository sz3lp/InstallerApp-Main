import React from "react";
import { Link, useLocation } from "react-router-dom";

type Props = {
  names?: Record<string, string>;
};

const Breadcrumbs: React.FC<Props> = ({ names = {} }) => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  let path = "";

  return (
    <nav className="bg-gray-50 px-4 py-2 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap text-gray-600">
        <li>
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </li>
        {segments.map((seg, idx) => {
          path += `/${seg}`;
          const isLast = idx === segments.length - 1;
          const label = names[seg] || seg;
          return (
            <li key={path} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span>{label}</span>
              ) : (
                <Link to={path} className="hover:underline">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
