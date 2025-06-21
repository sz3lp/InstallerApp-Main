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
import AdminNewJob from "./app/admin/jobs/NewJobPage";
import AdminJobDetail from "./app/admin/jobs/JobDetailPage";
import InstallerDashboard from "./app/installer/InstallerDashboard";
import InstallerJobPage from "./app/installer/jobs/JobPage";
import ManagerReview from "./app/manager/ReviewPage";
import LoginPage from "./app/login/LoginPage";
import { AuthProvider } from "./lib/hooks/useAuth";
import { RequireRole } from "./components/auth/RequireAuth";

const ClientsPage = lazy(() => import("./app/clients/ClientsPage"));
const QuotesPage = lazy(() => import("./app/quotes/QuotesPage"));
const InvoicesPage = lazy(() => import("./app/invoices/InvoicesPage"));
const PaymentsPage = lazy(() => import("./app/payments/PaymentsPage"));
const MessagesPanel = lazy(() => import("./app/messages/MessagesPanel"));
const TimeTrackingPanel = lazy(() => import("./app/time-tracking/TimeTrackingPanel"));
const ReportsPage = lazy(() => import("./app/reports/ReportsPage"));

const App = () => (
  <Router>
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireRole role="Installer" />}>
            <Route path="/" element={<InstallerHomePage />} />
            <Route path="/appointments" element={<AppointmentSummaryPage />} />
            <Route path="/activity" element={<ActivitySummaryPage />} />
            <Route path="/ifi" element={<IFIDashboard />} />
            <Route path="/job/:jobId" element={<JobDetailPage />} />
            <Route path="/mock-jobs" element={<MockJobsPage />} />
            <Route path="/installer/dashboard" element={<InstallerDashboard />} />
            <Route path="/installer/jobs/:id" element={<InstallerJobPage />} />
          </Route>
          <Route element={<RequireRole role="Admin" />}>
            <Route path="/admin/jobs/new" element={<AdminNewJob />} />
            <Route path="/admin/jobs/:id" element={<AdminJobDetail />} />
          </Route>
          <Route element={<RequireRole role="Manager" />}>
            <Route path="/manager/review" element={<ManagerReview />} />
          </Route>
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
    </AuthProvider>
  </Router>
);

export default App;
