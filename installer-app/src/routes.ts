import React from "react";

// Page components
import InstallerHomePage from "./installer/pages/InstallerHomePage";
import InstallerAppointmentPage from "./app/appointments/InstallerAppointmentPage";
import ActivityLogPage from "./app/activity/ActivityLogPage";
import JobDetailPage from "./installer/pages/JobDetailPage";
import IFIDashboard from "./installer/pages/IFIDashboard";
import JobsPage from "./installer/pages/JobsPage";
import FeedbackPage from "./installer/pages/FeedbackPage";
import InstallManagerDashboard from "./app/install-manager/page.jsx";
import CalendarPage from "./views/CalendarPage";
import InstallManagerCalendarPage from "./app/install-manager/InstallManagerCalendarPage";
import AdminDashboard from "./app/admin/AdminDashboard";
import AdminUsersPage from "./app/admin/AdminUsersPage";
import SalesDashboard from "./app/sales/SalesDashboard";
import NewJobBuilderPage from "./app/install-manager/job/NewJobBuilderPage";
import AdminNewJob from "./app/admin/jobs/AdminNewJob";
import AdminJobDetail from "./app/admin/jobs/JobDetailPage";
import MaterialTypesPage from "./app/admin/materials/MaterialTypesPage";
import InstallerDashboard from "./app/installer/InstallerDashboard";
import InstallerJobPage from "./app/installer/jobs/InstallerJobPage";
import InstallerProfilePage from "./app/installer/profile/InstallerProfilePage";
import QAReviewDashboardPage from "./app/manager/QAReviewDashboardPage";
import QAReviewDetailPage from "./app/manager/QAReviewDetailPage";
import ManagerReview from "./app/manager/ManagerReview";
import ArchivedJobsPage from "./app/archived/ArchivedJobsPage";
import InventoryPage from "./app/installer/InventoryPage";
import JobHistoryPage from "./app/installer/JobHistoryPage";
import InstallerSchedulePage from "./app/installer/InstallerSchedulePage";
import ClientsPage from "./app/clients/ClientsPage";
import ClientPaymentsPage from "./app/clients/ClientPaymentsPage";
import QuotesPage from "./app/quotes/QuotesPage";
import InvoicesPage from "./app/invoices/InvoicesPage";
import InvoiceDetailPage from "./app/invoices/InvoiceDetailPage";
import InvoiceGeneratorV2 from "./app/invoices/InvoiceGeneratorV2";
import PaymentsPage from "./app/payments/PaymentsPage";
import InvoiceGenerator from "./app/install-manager/InvoiceGenerator";
import PaymentLogger from "./app/install-manager/PaymentLogger";
import NotificationsPanel from "./app/install-manager/NotificationsPanel";
import MessagesPanel from "./app/messages/MessagesPanel";
import ReschedulingDashboard from "./app/dispatch/ReschedulingDashboard";
import TimeTrackingPanel from "./app/time-tracking/TimeTrackingPanel";
import ReportsPage from "./app/reports/ReportsPage";
import TechnicianPayReportPage from "./app/reports/TechnicianPayReportPage";
import InvoiceAgingPage from "./app/reports/InvoiceAgingPage";
import LeadFunnelDashboardPage from "./app/reports/LeadFunnelDashboardPage";
import RevenueDashboardPage from "./app/reports/RevenueDashboardPage";
import ARRevenueReportPage from "./app/reports/ARRevenueReportPage";
import InstallerPerformancePage from "./app/reports/InstallerPerformancePage";
import InstallTimeReportPage from "./app/reports/InstallTimeReportPage";
import LeadsPage from "./app/crm/LeadsPage";
import LeadForm from "./app/crm/LeadForm";
import LeadPipelinePage from "./app/crm/LeadPipelinePage";
import LeadDetailPage from "./app/crm/LeadDetailPage";
import PaymentReportPage from "./app/admin/reports/payments/PaymentReportPage";
import ARAgingReportPage from "./app/admin/reports/ar-aging/ARAgingReportPage";
import InventoryAlertsPage from "./app/admin/InventoryAlertsPage";
import PurchaseOrdersPage from "./app/inventory/PurchaseOrdersPage";
import ClosingDocsPage from "./app/jobs/ClosingDocsPage";
import UnderConstructionPage from "./app/UnderConstructionPage";
import Unauthorized from "./app/Unauthorized";
import LoginPage from "./app/login/LoginPage";
import ForgotPasswordPage from "./app/login/ForgotPasswordPage";
import ResetPasswordPage from "./app/login/ResetPasswordPage";
import RoleSelector from "./components/auth/RoleSelector";

export type RouteConfig = {
  path: string;
  element: React.ReactElement;
  roles?: string[];
  label?: string;
};

export const ROUTES: RouteConfig[] = [
  { path: "/login", element: React.createElement(LoginPage) },
  {
    path: "/forgot-password",
    element: React.createElement(ForgotPasswordPage),
  },
  { path: "/reset-password", element: React.createElement(ResetPasswordPage) },
  { path: "/unauthorized", element: React.createElement(Unauthorized) },
  { path: "/select-role", element: React.createElement(RoleSelector) },
  {
    path: "/",
    element: React.createElement(InstallerHomePage),
    roles: ["Installer"],
    label: "Home",
  },
  {
    path: "/appointments",
    element: React.createElement(InstallerAppointmentPage),
    roles: ["Installer"],
    label: "Appointment Summary",
  },
  {
    path: "/activity",
    element: React.createElement(ActivityLogPage),
    roles: ["Installer"],
    label: "Activity Summary",
  },
  {
    path: "/ifi",
    element: React.createElement(IFIDashboard),
    roles: ["Installer"],
    label: "IFI Dashboard",
  },
  {
    path: "/job/:jobId",
    element: React.createElement(JobDetailPage),
    roles: ["Installer"],
  },
  {
    path: "/jobs",
    element: React.createElement(JobsPage),
    roles: ["Installer"],
  },
  {
    path: "/installer",
    element: React.createElement(InstallerDashboard),
    roles: ["Installer"],
    label: "Installer Dashboard",
  },
  {
    path: "/installer/jobs/:id",
    element: React.createElement(InstallerJobPage),
    roles: ["Installer"],
  },
  {
    path: "/installer/profile",
    element: React.createElement(InstallerProfilePage),
    roles: ["Installer"],
  },
  {
    path: "/installer/inventory",
    element: React.createElement(InventoryPage),
    roles: ["Installer"],
  },
  {
    path: "/installer/history",
    element: React.createElement(JobHistoryPage),
    roles: ["Installer"],
  },
  {
    path: "/installer/schedule",
    element: React.createElement(InstallerSchedulePage),
    roles: ["Installer"],
    label: "Schedule",
  },
  {
    path: "/feedback",
    element: React.createElement(FeedbackPage),
    roles: ["Installer"],
    label: "Feedback",
  },
  {
    path: "/admin/dashboard",
    element: React.createElement(AdminDashboard),
    roles: ["Admin"],
    label: "Admin Dashboard",
  },
  {
    path: "/admin/users",
    element: React.createElement(AdminUsersPage),
    roles: ["Admin"],
    label: "User Management",
  },
  {
    path: "/admin/materials/types",
    element: React.createElement(MaterialTypesPage),
    roles: ["Admin"],
    label: "Material Types",
  },
  {
    path: "/admin/jobs/new",
    element: React.createElement(AdminNewJob),
    roles: ["Admin"],
  },
  {
    path: "/admin/jobs/:id",
    element: React.createElement(AdminJobDetail),
    roles: ["Admin"],
  },
  {
    path: "/manager/qa",
    element: React.createElement(QAReviewDashboardPage),
    roles: ["Manager"],
  },
  {
    path: "/manager/qa/job/:jobId",
    element: React.createElement(QAReviewDetailPage),
    roles: ["Manager"],
  },
  {
    path: "/manager/review",
    element: React.createElement(ManagerReview),
    roles: ["Manager"],
  },
  {
    path: "/admin/inventory-alerts",
    element: React.createElement(InventoryAlertsPage),
    roles: ["Install Manager", "Admin"],
    label: "Inventory Alerts",
  },
  {
    path: "/inventory/purchase-orders",
    element: React.createElement(PurchaseOrdersPage),
    roles: ["Install Manager", "Admin"],
    label: "Purchase Orders",
  },
  {
    path: "/archived",
    element: React.createElement(ArchivedJobsPage),
    roles: ["Install Manager", "Admin"],
  },
  {
    path: "/install-manager",
    element: React.createElement(InstallManagerDashboard),
    roles: ["Install Manager", "Admin"],
    label: "Install Manager Dashboard",
  },
  {
    path: "/install-manager/calendar",
    element: React.createElement(InstallManagerCalendarPage),
    roles: ["Install Manager", "Admin"],
    label: "Schedule Calendar",
  },
  {
    path: "/install-manager/job/new",
    element: React.createElement(NewJobBuilderPage),
    roles: ["Install Manager", "Admin"],
  },
  {
    path: "/install-manager/job/:id",
    element: React.createElement(UnderConstructionPage),
    roles: ["Install Manager"],
  },
  {
    path: "/install-manager/invoices/generate",
    element: React.createElement(InvoiceGenerator),
    roles: ["Install Manager", "Admin"],
  },
  {
    path: "/install-manager/payments/log",
    element: React.createElement(PaymentLogger),
    roles: ["Install Manager", "Admin"],
  },
  {
    path: "/install-manager/notifications",
    element: React.createElement(NotificationsPanel),
    roles: ["Install Manager", "Admin"],
    label: "Notifications",
  },
  {
    path: "/dispatch/rescheduling",
    element: React.createElement(ReschedulingDashboard),
    roles: ["Manager", "Dispatcher"],
    label: "Reschedule Requests",
  },
  {
    path: "/clients",
    element: React.createElement(ClientsPage),
    roles: ["Manager", "Admin"],
    label: "Clients",
  },
  {
    path: "/clients/:id/payments",
    element: React.createElement(ClientPaymentsPage),
    roles: ["Sales", "Admin"],
  },
  {
    path: "/crm/leads",
    element: React.createElement(LeadsPage),
    roles: ["Sales", "Manager", "Admin"],
    label: "Leads",
  },
  {
    path: "/crm/leads/:id",
    element: React.createElement(LeadDetailPage),
    roles: ["Sales", "Manager", "Admin"],
  },
  {
    path: "/crm/pipeline",
    element: React.createElement(LeadPipelinePage),
    roles: ["Sales", "Manager", "Admin"],
    label: "Lead Pipeline",
  },
  {
    path: "/crm/leads/new",
    element: React.createElement(LeadForm),
    roles: ["Sales"],
    label: "Add Lead",
  },
  {
    path: "/sales/dashboard",
    element: React.createElement(SalesDashboard),
    roles: ["Sales", "Manager", "Admin"],
    label: "Sales Dashboard",
  },
  {
    path: "/quotes",
    element: React.createElement(QuotesPage),
    roles: ["Manager", "Admin"],
    label: "Quotes",
  },
  {
    path: "/invoices",
    element: React.createElement(InvoicesPage),
    roles: ["Manager", "Admin"],
    label: "Invoices",
  },
  {
    path: "/invoices/:id",
    element: React.createElement(InvoiceDetailPage),
    roles: ["Admin", "Finance"],
  },
  {
    path: "/invoices/generate",
    element: React.createElement(InvoiceGeneratorV2),
    roles: ["Admin", "Sales", "Finance"],
  },
  {
    path: "/payments",
    element: React.createElement(PaymentsPage),
    roles: ["Manager", "Admin"],
    label: "Payments",
  },
  {
    path: "/messages",
    element: React.createElement(MessagesPanel),
    roles: ["Manager", "Admin"],
    label: "Messages",
  },
  {
    path: "/time-tracking",
    element: React.createElement(TimeTrackingPanel),
    roles: ["Manager", "Admin"],
    label: "Time Tracking",
  },
  {
    path: "/reports",
    element: React.createElement(ReportsPage),
    roles: ["Manager", "Admin"],
    label: "Reports",
  },
  {
    path: "/reports/technician-pay",
    element: React.createElement(TechnicianPayReportPage),
    roles: ["Admin", "Install Manager"],
    label: "Technician Pay",
  },
  {
    path: "/reports/installers",
    element: React.createElement(InstallerPerformancePage),
    roles: ["Admin", "Manager"],
    label: "Installer Performance",
  },
  {
    path: "/reports/install-time",
    element: React.createElement(InstallTimeReportPage),
    roles: ["Admin", "Manager"],
    label: "Install Time",
  },
  {
    path: "/reports/revenue",
    element: React.createElement(RevenueDashboardPage),
    roles: ["Admin", "Finance"],
    label: "Revenue",
  },
  {
    path: "/reports/ar-revenue",
    element: React.createElement(ARRevenueReportPage),
    roles: ["Admin", "Finance"],
    label: "AR Revenue",
  },
  {
    path: "/reports/lead-funnel",
    element: React.createElement(LeadFunnelDashboardPage),
    roles: ["Admin", "Sales", "Manager"],
    label: "Lead Funnel",
  },
  {
    path: "/reports/invoice-aging",
    element: React.createElement(InvoiceAgingPage),
    roles: ["Manager", "Admin"],
  },
  {
    path: "/admin/reports/ar-aging",
    element: React.createElement(ARAgingReportPage),
    roles: ["Admin", "Finance", "Sales"],
    label: "AR Aging Report",
  },
  {
    path: "/admin/reports/payments",
    element: React.createElement(PaymentReportPage),
    roles: ["Admin", "Finance"],
    label: "Payment Reports",
  },
  {
    path: "/jobs/:id/closing-docs",
    element: React.createElement(ClosingDocsPage),
    roles: ["Installer", "Manager", "Admin"],
  },
];

export const navLinks = ROUTES.filter((r) => r.label);
