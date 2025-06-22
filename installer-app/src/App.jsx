import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InstallerHomePage from "./installer/pages/InstallerHomePage";
import InstallerAppointmentPage from "./app/appointments/InstallerAppointmentPage";
import ActivityLogPage from "./app/activity/ActivityLogPage";
import JobDetailPage from "./installer/pages/JobDetailPage";
import IFIDashboard from "./installer/pages/IFIDashboard";
import MockJobsPage from "./installer/pages/MockJobsPage";
import FeedbackPage from "./installer/pages/FeedbackPage";
import InstallManagerDashboard from "./app/install-manager/page.jsx";
import NewJobBuilderPage from "./app/install-manager/job/NewJobBuilderPage";
import AdminNewJob from "./app/admin/jobs/AdminNewJob";
import AdminJobDetail from "./app/admin/jobs/JobDetailPage";
import InstallerDashboard from "./app/installer/InstallerDashboard";
import InstallerJobPage from "./app/installer/jobs/InstallerJobPage";
import InstallerProfilePage from "./app/installer/profile/InstallerProfilePage";
import QAReviewPanel from "./app/manager/QAReviewPanel";
import ManagerReview from "./app/manager/ManagerReview";
import ArchivedJobsPage from "./app/manager/ArchivedJobsPage";
import ArchivedJobsPage from "./app/archived/ArchivedJobsPage";
import InventoryPage from "./app/installer/InventoryPage";
import ManagerReview from "./app/manager/ManagerReview";
import ArchivedJobsPage from "./app/archived/ArchivedJobsPage";
import ManagerReview from "./app/manager/ManagerReview";
import ArchivedJobsPage from "./app/archived/ArchivedJobsPage";
import JobHistoryPage from "./app/installer/JobHistoryPage";
import ManagerReview from "./app/manager/ManagerReview";
import ArchivedJobsPage from "./app/archived/ArchivedJobsPage";
const LeadsPage = lazy(() => import("./app/crm/LeadsPage"));
import ManagerReview from "./app/manager/ReviewPage";
import LoginPage from "./app/login/LoginPage";
import { AuthProvider } from "./lib/hooks/useAuth";
import { RequireRole as RequireRoleOutlet } from "./components/auth/RequireAuth";
import RequireRole from "./components/RequireRole";
import UnderConstructionPage from "./app/UnderConstructionPage";

const ClientsPage = lazy(() => import("./app/clients/ClientsPage"));
const QuotesPage = lazy(() => import("./app/quotes/QuotesPage"));
const InvoicesPage = lazy(() => import("./app/invoices/InvoicesPage"));
const PaymentsPage = lazy(() => import("./app/payments/PaymentsPage"));
const MessagesPanel = lazy(() => import("./app/messages/MessagesPanel"));
const TimeTrackingPanel = lazy(() => import("./app/time-tracking/TimeTrackingPanel"));
const ReportsPage = lazy(() => import("./app/reports/ReportsPage"));
const LeadsPage = lazy(() => import("./app/crm/LeadsPage"));

const App = () => (
  <Router>
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireRoleOutlet role="Installer" />}>
            <Route path="/" element={<InstallerHomePage />} />
            <Route path="/appointments" element={<InstallerAppointmentPage />} />
            <Route path="/activity" element={<ActivityLogPage />} />
            <Route path="/ifi" element={<IFIDashboard />} />
            <Route path="/job/:jobId" element={<JobDetailPage />} />
            <Route path="/mock-jobs" element={<MockJobsPage />} />
            <Route path="/installer" element={<InstallerDashboard />} />
            <Route path="/installer/dashboard" element={<InstallerDashboard />} />
            <Route path="/installer/jobs/:id" element={<InstallerJobPage />} />
            <Route path="/installer/profile" element={<InstallerProfilePage />} />
            <Route path="/installer/inventory" element={<InventoryPage />} />
            <Route path="/installer/history" element={<JobHistoryPage />} />
          </Route>

          <Route element={<RequireRoleOutlet role="Admin" />}>
            <Route path="/admin/jobs/new" element={<AdminNewJob />} />
            <Route path="/admin/jobs/:id" element={<AdminJobDetail />} />
          </Route>

          <Route element={<RequireRoleOutlet role="Manager" />}>
            <Route path="/manager/review" element={<QAReviewPanel />} />
          </Route>
        <Route element={<RequireRoleOutlet role="Manager" />}>
          <Route path="/manager/review" element={<ManagerReview />} />
        </Route>

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
            path="/install-manager/job/new"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <NewJobBuilderPage />
              </RequireRole>
            }
          />
          <Route
          <Route
            path="/crm/leads"
            element={
              <RequireRole role={["Sales", "Manager", "Admin"]}>
                <LeadsPage />
              </RequireRole>
            }
          />
            path="/install-manager/job/:id"
            element={
              <RequireRole role={["Manager", "Admin"]}>
                <UnderConstructionPage />
              </RequireRole>
            }
          />

          <Route
            path="/feedback"
            element={
              <RequireRole role={["Installer", "Manager", "Admin"]}>
                <FeedbackPage />
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
