import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";
import OnboardingPanel from "../onboarding/OnboardingPanel";
import { useAuth } from "../../lib/hooks/useAuth";
import useProfile from "../../lib/hooks/useProfile";

const GlobalLayout: React.FC = () => {
  const [open, setOpen] = useState(true);
  const { user, role } = useAuth();
  const { profile } = useProfile(user?.id ?? null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) setOpen(saved === "true");
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem("sidebarOpen", String(next));
  };

  const showOnboarding =
    profile && !profile.onboarded && role !== "Admin" && !dismissed;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={toggle} />
        <Breadcrumbs />
        {showOnboarding && (
          <OnboardingPanel onComplete={() => setDismissed(true)} />
        )}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GlobalLayout;
