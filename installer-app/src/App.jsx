import React, { Suspense, lazy } from "react";
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

const ClientsPage = lazy(() => import("./app/clients/ClientsPage"));
const QuotesPage = lazy(() => import("./app/quotes/QuotesPage"));
const InvoicesPage = lazy(() => import("./app/invoices/InvoicesPage"));
const PaymentsPage = lazy(() => import("./app/payments/PaymentsPage"));
const MessagesPanel = lazy(() => import("./app/messages/MessagesPanel"));
const TimeTrackingPanel = lazy(
  () => import("./app/time-tracking/TimeTrackingPanel"),
);
const ReportsPage = lazy(() => import("./app/reports/ReportsPage"));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
      <Route path="/" element={<InstallerHomePage />} />
      <Route path="/appointments" element={<AppointmentSummaryPage />} />
      <Route path="/activity" element={<ActivitySummaryPage />} />
      <Route path="/ifi" element={<IFIDashboard />} />
      <Route path="/job/:jobId" element={<JobDetailPage />} />
      <Route path="/mock-jobs" element={<MockJobsPage />} />
      <Route path="/install-manager" element={<InstallManagerDashboard />} />
      <Route path="/install-manager/job/new" element={<NewJobBuilderPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/quotes" element={<QuotesPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/messages" element={<MessagesPanel />} />
      <Route path="/time-tracking" element={<TimeTrackingPanel />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Routes>
    </Suspense>
  </Router>
);

export default App;
