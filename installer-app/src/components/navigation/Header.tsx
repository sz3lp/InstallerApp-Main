import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBell, FaSearch } from "react-icons/fa";
import { useAuth } from "../../lib/hooks/useAuth";

type Props = {
  onToggleSidebar: () => void;
};

const roleDashboard: Record<string, string> = {
  Admin: "/admin/dashboard",
  Manager: "/manager/dashboard",
  Sales: "/sales/dashboard",
  Installer: "/installer/dashboard",
};

const Header: React.FC<Props> = ({ onToggleSidebar }) => {
  const { user, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const dashboard = role ? roleDashboard[role] ?? "/" : "/";

  return (
    <header className="bg-gray-800 text-white flex items-center justify-between px-4 py-2 shadow">
      <button
        className="md:hidden mr-2"
        aria-label="Toggle Menu"
        onClick={onToggleSidebar}
      >
        ≡
      </button>
      <Link to={dashboard} className="font-bold text-lg">
        SentientZone
      </Link>
      <div className="flex items-center space-x-4 relative">
        <FaSearch className="cursor-pointer" />
        <FaBell className="cursor-pointer" />
        <button onClick={() => setOpen((o) => !o)} className="font-medium">
          {user?.email}
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-40 bg-white text-gray-700 rounded shadow z-10">
            <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
              My Profile
            </Link>
            {user && (user as any).selected_role && (
              <Link to="#" className="block px-4 py-2 hover:bg-gray-100">
                Switch Role
              </Link>
            )}
            <button
              onClick={signOut}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
