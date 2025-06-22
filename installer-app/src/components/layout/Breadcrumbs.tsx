import { Link, useLocation } from "react-router-dom";

interface BreadcrumbsProps {
  names?: Record<string, string>;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ names = {} }) => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    const label = names[seg] || seg.replace(/-/g, " ");
    return { path, label };
  });

  return (
    <nav className="text-sm mb-4" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        <li>
          <Link to="/">Home</Link>
        </li>
        {crumbs.map((crumb, idx) => (
          <li key={crumb.path} className="flex items-center">
            <span className="mx-2">/</span>
            {idx === crumbs.length - 1 ? (
              <span className="text-gray-500">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="text-blue-600 hover:underline">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
