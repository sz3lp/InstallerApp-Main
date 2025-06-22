import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? stored === "true" : true;
  });

  const toggle = () => setSidebarOpen((o) => !o);
  const close = () => setSidebarOpen(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={toggle} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={close} />
        <main className="flex-1 p-4 overflow-y-auto md:ml-64">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
