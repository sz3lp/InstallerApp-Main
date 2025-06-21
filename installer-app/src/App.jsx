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
import UnauthorizedPage from "./app/UnauthorizedPage";
import { AuthProvider } from "./lib/hooks/useAuth";
import { RequireRole as RequireRoleOutlet } from "./components/auth/RequireAuth";
import RequireRole from "./components/RequireRole";

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
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<RequireRoleOutlet role="Installer" />}>
            <Route path="/" element={<InstallerHomePage />} />
            <Route path="/appointments" element={<AppointmentSummaryPage />} />
            <Route path="/activity" element={<ActivitySummaryPage />} />
            <Route path="/ifi" element={<IFIDashboard />} />
            <Route path="/job/:jobId" element={<JobDetailPage />} />
            <Route path="/mock-jobs" element={<MockJobsPage />} />
          </Route>
          <Route path="/installer" element={<RequireRoleOutlet role="Installer" />}>
            <Route path="dashboard" element={<InstallerDashboard />} />
            <Route path="jobs/:id" element={<InstallerJobPage />} />
          </Route>
          <Route path="/admin" element={<RequireRoleOutlet role="Admin" />}>
            <Route path="jobs/new" element={<AdminNewJob />} />
            <Route path="jobs/:id" element={<AdminJobDetail />} />
          </Route>
          <Route path="/manager" element={<RequireRoleOutlet role="Manager" />}>
            <Route path="review" element={<ManagerReview />} />
          </Route>
          <Route
            path="/install-manager"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <InstallManagerDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/install-manager/job/new"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <NewJobBuilderPage />
              </RequireRole>
            }
          />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route
            path="/clients"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <ClientsPage />
              </RequireRole>
            }
          />
          <Route
            path="/quotes"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <QuotesPage />
              </RequireRole>
            }
          />
          <Route
            path="/invoices"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <InvoicesPage />
              </RequireRole>
            }
          />
          <Route
            path="/payments"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <PaymentsPage />
              </RequireRole>
            }
          />
          <Route
            path="/messages"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <MessagesPanel />
              </RequireRole>
            }
          />
          <Route
            path="/time-tracking"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <TimeTrackingPanel />
              </RequireRole>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <ReportsPage />
              </RequireRole>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  </Router>
);

export default App;
