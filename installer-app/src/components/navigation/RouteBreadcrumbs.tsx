import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { navLinks } from "../../navConfig";

const labelMap = navLinks.reduce<Record<string, string>>((acc, route) => {
  if (route.label) {
    acc[route.path] = route.label;
  }
  return acc;
}, {});

const RouteBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const [expanded, setExpanded] = useState(false);

  const crumbs = useMemo(() => {
    let current = "";
    return segments.map((seg) => {
      current += `/${seg}`;
      const label = labelMap[current] || seg.replace(/-/g, " ");
      return { path: current, label };
    });
  }, [segments]);

  let displayCrumbs = crumbs;
  let collapsed = false;
  if (!expanded && crumbs.length > 3) {
    collapsed = true;
    displayCrumbs = crumbs.slice(-2);
  }

  return (
    <nav className="bg-gray-50 px-4 py-2 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap">
        <li>
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </li>
        {collapsed && (
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <button
              onClick={() => setExpanded(true)}
              className="hover:underline focus:outline-none"
            >
              ...
            </button>
          </li>
        )}
        {displayCrumbs.map((crumb, idx) => {
          const isLast = idx === displayCrumbs.length - 1 && !collapsed;
          return (
            <li key={crumb.path} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-gray-700" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.path} className="hover:underline">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default RouteBreadcrumbs;
