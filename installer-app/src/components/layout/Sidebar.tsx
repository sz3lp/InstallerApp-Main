import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useAuth } from "../../lib/hooks/useAuth";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface LinkItem {
  to: string;
  label: string;
}

const adminLinks: LinkItem[] = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/clients", label: "Clients" },
  { to: "/leads", label: "Leads" },
  { to: "/quotes", label: "Quotes" },
  { to: "/jobs", label: "Jobs" },
  { to: "/invoices", label: "Invoices" },
  { to: "/payments", label: "Payments" },
  { to: "/reports", label: "Reports" },
  { to: "/reports/technician-pay", label: "Technician Pay" },
  { to: "/settings", label: "Settings" },
];

const managerLinks: LinkItem[] = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/clients", label: "Clients" },
  { to: "/leads", label: "Leads" },
  { to: "/quotes", label: "Quotes" },
  { to: "/jobs", label: "Jobs" },
  { to: "/invoices", label: "Invoices" },
  { to: "/payments", label: "Payments" },
  { to: "/reports", label: "Reports" },
  { to: "/reports/technician-pay", label: "Technician Pay" },
  { to: "/settings", label: "Settings" },
];

const salesLinks: LinkItem[] = [
  { to: "/sales/dashboard", label: "Dashboard" },
  { to: "/leads", label: "Leads" },
  { to: "/quotes", label: "Quotes" },
  { to: "/clients", label: "Clients" },
];

const installerLinks: LinkItem[] = [
  { to: "/installer/dashboard", label: "Dashboard" },
  { to: "/installer/jobs", label: "My Jobs" },
  { to: "/installer/materials", label: "Material Logger" },
];

function getLinks(role: string | null): LinkItem[] {
  switch (role) {
    case "Admin":
      return adminLinks;
    case "Manager":
      return managerLinks;
    case "Sales":
      return salesLinks;
    default:
      return installerLinks;
  }
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { role } = useAuth();
  const links = getLinks(role);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", open ? "true" : "false");
  }, [open]);

  return (
    <aside
      className={`bg-gray-800 text-white w-64 space-y-1 px-4 py-4 transform ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200 fixed md:static inset-y-0 left-0 z-40`}
    >
      <button className="md:hidden mb-4" onClick={onClose} aria-label="Close Menu">
        <FaTimes />
      </button>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `block px-2 py-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
          }
          onClick={onClose}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
