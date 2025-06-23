import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBell, FaSearch, FaBars } from "react-icons/fa";
import { useAuth } from "../../lib/hooks/useAuth";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const dashboardPath: Record<string, string> = {
  Admin: "/admin/dashboard",
  Manager: "/manager/dashboard",
  Sales: "/sales/dashboard",
  Installer: "/installer",
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboard = dashboardPath[role ?? ""] || "/";

  return (
    <header className="bg-gray-800 text-white flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-xl focus:outline-none"
          aria-label="Toggle Menu"
        >
          <FaBars />
        </button>
        <Link to={dashboard} className="text-lg font-bold">
          SentientZone
        </Link>
      </div>
      <div className="flex items-center gap-4 relative">
        <button aria-label="Notifications" className="text-xl">
          <FaBell />
        </button>
        <button aria-label="Search" className="text-xl">
          <FaSearch />
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-sm font-semibold focus:outline-none"
        >
          {user?.email}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 rounded shadow z-10">
            <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
              My Profile
            </Link>
            {user && (user as any).selected_role && (
              <Link to="/switch-role" className="block px-4 py-2 hover:bg-gray-100">
                Switch Role
              </Link>
            )}
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={signOut}
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
