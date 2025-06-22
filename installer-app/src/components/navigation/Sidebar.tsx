import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../lib/hooks/useAuth";

type Props = {
  open: boolean;
  onClose: () => void;
};

const menu = {
  Admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Clients", path: "/clients" },
    { label: "Leads", path: "/leads" },
    { label: "Quotes", path: "/quotes" },
    { label: "Jobs", path: "/jobs" },
    { label: "Invoices", path: "/invoices" },
    { label: "Payments", path: "/payments" },
    { label: "Reports", path: "/reports" },
    { label: "Technician Pay", path: "/reports/technician-pay" },
    { label: "Settings", path: "/settings" },
  ],
  Manager: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Clients", path: "/clients" },
    { label: "Leads", path: "/leads" },
    { label: "Quotes", path: "/quotes" },
    { label: "Jobs", path: "/jobs" },
    { label: "Invoices", path: "/invoices" },
    { label: "Payments", path: "/payments" },
    { label: "Reports", path: "/reports" },
    { label: "Technician Pay", path: "/reports/technician-pay" },
    { label: "Settings", path: "/settings" },
  ],
  Sales: [
    { label: "Dashboard", path: "/sales/dashboard" },
    { label: "Leads", path: "/leads" },
    { label: "Quotes", path: "/quotes" },
    { label: "Clients", path: "/clients" },
  ],
  Installer: [
    { label: "Dashboard", path: "/installer/dashboard" },
    { label: "My Jobs", path: "/installer/jobs" },
    { label: "Material Logger", path: "/installer/materials" },
  ],
};

const Sidebar: React.FC<Props> = ({ open, onClose }) => {
  const { role } = useAuth();
  const items = role ? (menu as any)[role] || [] : [];

  return (
    <div
      className={`${
        open ? "block" : "hidden"
      } md:block bg-gray-900 text-white w-64 flex-shrink-0`}
    >
      <nav className="p-4 space-y-1">
        {items.map((item: any) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-2 py-1 rounded hover:bg-gray-800 ${
                isActive ? "bg-gray-800" : ""
              }`
            }
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
