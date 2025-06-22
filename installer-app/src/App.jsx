import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import GlobalLayout from "./components/navigation/GlobalLayout";
import InstallerHomePage from "./installer/pages/InstallerHomePage";
import InstallerAppointmentPage from "./app/appointments/InstallerAppointmentPage";
import ActivityLogPage from "./app/activity/ActivityLogPage";
import JobDetailPage from "./installer/pages/JobDetailPage";
import IFIDashboard from "./installer/pages/IFIDashboard";
import MockJobsPage from "./installer/pages/MockJobsPage";
import FeedbackPage from "./installer/pages/FeedbackPage";
import InstallManagerDashboard from "./app/install-manager/page.jsx";
import AdminDashboard from "./app/admin/AdminDashboard";
import SalesDashboard from "./app/sales/SalesDashboard";
import NewJobBuilderPage from "./app/install-manager/job/NewJobBuilderPage";
import AdminNewJob from "./app/admin/jobs/AdminNewJob";
import AdminJobDetail from "./app/admin/jobs/JobDetailPage";
import InstallerDashboard from "./app/installer/InstallerDashboard";
import InstallerJobPage from "./app/installer/jobs/InstallerJobPage";
import InstallerProfilePage from "./app/installer/profile/InstallerProfilePage";
import QAReviewDashboardPage from "./app/manager/QAReviewDashboardPage";
import QAReviewDetailPage from "./app/manager/QAReviewDetailPage";
import ManagerReview from "./app/manager/ManagerReview";
import ArchivedJobsPage from "./app/archived/ArchivedJobsPage";
import InventoryPage from "./app/installer/InventoryPage";
import JobHistoryPage from "./app/installer/JobHistoryPage";
import LoginPage from "./app/login/LoginPage";
import { AuthProvider } from "./lib/hooks/useAuth";
import {
  RequireRole as RequireRoleOutlet,
  RequireAuth as RequireAuthOutlet,
} from "./components/auth/RequireAuth";
import RequireRole from "./components/RequireRole";
import AppLayout from "./components/layout/AppLayout";
import UnderConstructionPage from "./app/UnderConstructionPage";

const ClientsPage = lazy(() => import("./app/clients/ClientsPage"));
const QuotesPage = lazy(() => import("./app/quotes/QuotesPage"));
const InvoicesPage = lazy(() => import("./app/invoices/InvoicesPage"));
const PaymentsPage = lazy(() => import("./app/payments/PaymentsPage"));
const MessagesPanel = lazy(() => import("./app/messages/MessagesPanel"));
const TimeTrackingPanel = lazy(
  () => import("./app/time-tracking/TimeTrackingPanel"),
);
const ReportsPage = lazy(() => import("./app/reports/ReportsPage"));
const LeadsPage = lazy(() => import("./app/crm/LeadsPage"));

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuthOutlet />}>
              <Route element={<GlobalLayout />}>
                {/* Installer Routes */}
                <Route element={<RequireRoleOutlet role="Installer" />}>
                  <Route path="/" element={<InstallerHomePage />} />
                  <Route
                    path="/appointments"
                    element={<InstallerAppointmentPage />}
                  />
                  <Route path="/activity" element={<ActivityLogPage />} />
                  <Route path="/ifi" element={<IFIDashboard />} />
                  <Route path="/job/:jobId" element={<JobDetailPage />} />
                  <Route path="/mock-jobs" element={<MockJobsPage />} />
                  <Route path="/installer" element={<InstallerDashboard />} />
                  <Route
                    path="/installer/dashboard"
                    element={<InstallerDashboard />}
                  />
                  <Route
                    path="/installer/jobs/:id"
                    element={<InstallerJobPage />}
                  />
                  <Route
                    path="/installer/profile"
                    element={<InstallerProfilePage />}
                  />
                  <Route
                    path="/installer/inventory"
                    element={<InventoryPage />}
                  />
                  <Route
                    path="/installer/history"
                    element={<JobHistoryPage />}
                  />
                  <Route path="/feedback" element={<FeedbackPage />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<RequireRoleOutlet role="Admin" />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/jobs/new" element={<AdminNewJob />} />
                  <Route path="/admin/jobs/:id" element={<AdminJobDetail />} />
                </Route>

                {/* Manager Routes */}
                <Route element={<RequireRoleOutlet role="Manager" />}>
                  <Route
                    path="/manager/qa"
                    element={<QAReviewDashboardPage />}
                  />
                  <Route
                    path="/manager/qa/job/:jobId"
                    element={<QAReviewDetailPage />}
                  />
                  <Route path="/manager/review" element={<ManagerReview />} />
                </Route>

                {/* Shared Manager/Admin Routes */}
                <Route
                  path="/manager/archived"
                  element={
                    <RequireRole role={["Manager", "Admin"]}>
                      <ArchivedJobsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/archived"
                  element={
                    <RequireRole role={["Manager", "Admin"]}>
                      <ArchivedJobsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/install-manager"
                  element={
                    <RequireRole role={["Manager", "Admin"]}>
                      <InstallManagerDashboard />
                    </RequireRole>
                  }
                />
                <Route
                  path="/install-manager/dashboard"
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
                <Route
                  path="/install-manager/job/:id"
                  element={
                    <RequireRole role={["Manager", "Admin"]}>
                      <UnderConstructionPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <RequireRole role={["Manager", "Admin"]}>
                      <ClientsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/crm/leads"
                  element={
                    <RequireRole role={["Sales", "Manager", "Admin"]}>
                      <LeadsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/sales/dashboard"
                  element={
                    <RequireRole role={["Sales", "Manager", "Admin"]}>
                      <SalesDashboard />
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

                {/* Fallback for authenticated routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>

            {/* Fallback for unauthenticated routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
