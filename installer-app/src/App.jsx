import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InstallerHomePage from "./installer/pages/InstallerHomePage";
import AppointmentSummaryPage from "./installer/pages/AppointmentSummaryPage";
import ActivitySummaryPage from "./installer/pages/ActivitySummaryPage";
import JobDetailPage from "./installer/pages/JobDetailPage";
import IFIDashboard from "./installer/pages/IFIDashboard";
import MockJobsPage from "./installer/pages/MockJobsPage";
import FeedbackPage from "./installer/pages/FeedbackPage";
import InstallManagerDashboard from "./app/install-manager/page.jsx";
import NewJobBuilderPage from "./app/install-manager/job/NewJobBuilderPage";
import ManagerJobDetailPage from "./app/install-manager/job/JobDetailPage";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<InstallerHomePage />} />
      <Route path="/appointments" element={<AppointmentSummaryPage />} />
      <Route path="/activity" element={<ActivitySummaryPage />} />
      <Route path="/ifi" element={<IFIDashboard />} />
      <Route path="/job/:jobId" element={<JobDetailPage />} />
      <Route path="/mock-jobs" element={<MockJobsPage />} />
      <Route path="/install-manager" element={<InstallManagerDashboard />} />
      <Route path="/install-manager/job/new" element={<NewJobBuilderPage />} />
      <Route
        path="/install-manager/job/:jobId"
        element={<ManagerJobDetailPage />}
      />
      <Route path="/feedback" element={<FeedbackPage />} />
    </Routes>
  </Router>
);

export default App;
