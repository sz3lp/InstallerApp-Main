import React, { useState } from "react";
import { FaSyncAlt, FaBriefcase, FaClock } from "react-icons/fa";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../lib/hooks/useAuth";
import Header from "../components/Header";
import SideDrawer from "../components/SideDrawer";
import OpenManagerPreview from "../components/OpenManagerPreview";

const InstallerHomePage = ({
  installerEmail = "lukepreble@outlook.com",
  inventoryValue = 0,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const navigate = useNavigate();
  const { session, isAuthorized, loading } = useAuth();
  const handleDrawer = () => setShowDrawer(true);
  const handleRefresh = () => navigate(0);
  const handleAppointmentSummary = () => navigate("/appointments");
  const handleActivitySummary = () => navigate("/activity");

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAuthorized("Installer")) return <Navigate to="/unauthorized" replace />;

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen relative">
      <SideDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />

      <Header
        title="SentientZone"
        onMenuClick={handleDrawer}
        rightIcon={<FaSyncAlt />}
        onRightIconClick={handleRefresh}
      />
      <main className="flex-grow px-4 py-6">
        <div className="max-w-3xl mx-auto py-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome!</h1>
            <p className="text-gray-600">{installerEmail}</p>
          </div>

          <section>
            <h2 className="text-lg font-semibold mb-2">Appointments</h2>
            <button
              className="w-full bg-green-600 text-white py-2 rounded-md flex items-center justify-center"
              onClick={handleAppointmentSummary}
            >
              <FaBriefcase className="mr-2" /> Appointment Summary
            </button>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
            <button
              className="w-full bg-green-600 text-white py-2 rounded-md flex items-center justify-center"
              onClick={handleActivitySummary}
            >
              <FaClock className="mr-2" /> Activity Summary
            </button>
          </section>

          <footer className="pt-6 text-center text-sm text-muted-foreground">
            Total Current Inventory Amount:{" "}
            <strong>${inventoryValue.toFixed(2)}</strong>
          </footer>
        </div>
      </main>
      <OpenManagerPreview />
    </div>
  );
};

export default InstallerHomePage;
