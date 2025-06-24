import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../lib/hooks/useAuth";
import { navLinks } from "../../navConfig";

type Props = {
  open: boolean;
  onClose: () => void;
};

const Sidebar: React.FC<Props> = ({ open, onClose }) => {
  const { role } = useAuth();
  const items = navLinks.filter(
    (l) => !l.roles || l.roles.includes(role as any),
  );

  return (
    <div
      className={`${open ? "block" : "hidden"} md:block bg-gray-900 text-white w-64 flex-shrink-0`}
    >
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-2 py-1 rounded hover:bg-gray-800 ${isActive ? "bg-gray-800" : ""}`
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
