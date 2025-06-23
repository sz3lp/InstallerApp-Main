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
import CalendarPage from "./app/install-manager/CalendarPage";
import AdminDashboard from "./app/admin/AdminDashboard";
import AdminUsersPage from "./app/admin/users/AdminUsersPage";
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
import ClientsPage from "./app/clients/ClientsPage";
import QuotesPage from "./app/quotes/QuotesPage";
import InvoicesPage from "./app/invoices/InvoicesPage";
import InvoiceDetailPage from "./app/invoices/InvoiceDetailPage";
import PaymentsPage from "./app/payments/PaymentsPage";
import InvoiceGenerator from "./app/install-manager/InvoiceGenerator";
import PaymentLogger from "./app/install-manager/PaymentLogger";
import MessagesPanel from "./app/messages/MessagesPanel";
import TimeTrackingPanel from "./app/time-tracking/TimeTrackingPanel";
import ReportsPage from "./app/reports/ReportsPage";
import TechnicianPayReportPage from "./app/reports/TechnicianPayReportPage";
import InvoiceAgingPage from "./app/reports/InvoiceAgingPage";
import LeadsPage from "./app/crm/LeadsPage";
import PaymentReportPage from "./app/admin/reports/payments/PaymentReportPage";
import InventoryAlertsPage from "./app/manager/InventoryAlertsPage";
import UnderConstructionPage from "./app/UnderConstructionPage";
import Unauthorized from "./app/Unauthorized";
import LoginPage from "./app/login/LoginPage";
import ForgotPasswordPage from "./app/login/ForgotPasswordPage";
import ResetPasswordPage from "./app/login/ResetPasswordPage";
import RoleSelector from "./components/auth/RoleSelector";

export type RouteConfig = {
  path: string;
  element: React.ReactElement;
  role?: string | string[];
  label?: string;
};

export const ROUTES: RouteConfig[] = [
  { path: "/login", element: React.createElement(LoginPage) },
  { path: "/forgot-password", element: React.createElement(ForgotPasswordPage) },
  { path: "/reset-password", element: React.createElement(ResetPasswordPage) },
  { path: "/unauthorized", element: React.createElement(Unauthorized) },
  { path: "/select-role", element: React.createElement(RoleSelector) },
  {
    path: "/",
    element: React.createElement(InstallerHomePage),
    role: "Installer",
    label: "Home",
  },
  {
    path: "/appointments",
    element: React.createElement(InstallerAppointmentPage),
    role: "Installer",
    label: "Appointment Summary",
  },
  {
    path: "/activity",
    element: React.createElement(ActivityLogPage),
    role: "Installer",
    label: "Activity Summary",
  },
  {
    path: "/ifi",
    element: React.createElement(IFIDashboard),
    role: "Installer",
    label: "IFI Dashboard",
  },
  {
    path: "/job/:jobId",
    element: React.createElement(JobDetailPage),
    role: "Installer",
  },
  {
    path: "/jobs",
    element: React.createElement(JobsPage),
    role: "Installer",
  },
  {
    path: "/installer",
    element: React.createElement(InstallerDashboard),
    role: "Installer",
    label: "Installer Dashboard",
  },
  {
    path: "/installer/jobs/:id",
    element: React.createElement(InstallerJobPage),
    role: "Installer",
  },
  {
    path: "/installer/profile",
    element: React.createElement(InstallerProfilePage),
    role: "Installer",
  },
  {
    path: "/installer/inventory",
    element: React.createElement(InventoryPage),
    role: "Installer",
  },
  {
    path: "/installer/history",
    element: React.createElement(JobHistoryPage),
    role: "Installer",
  },
  {
    path: "/feedback",
    element: React.createElement(FeedbackPage),
    role: "Installer",
    label: "Feedback",
  },
  {
    path: "/admin/dashboard",
    element: React.createElement(AdminDashboard),
    role: "Admin",
    label: "Admin Dashboard",
  },
  {
    path: "/admin/users",
    element: React.createElement(AdminUsersPage),
    role: "Admin",
    label: "User Management",
  },
  {
    path: "/admin/materials/types",
    element: React.createElement(MaterialTypesPage),
    role: "Admin",
    label: "Material Types",
  },
  {
    path: "/admin/jobs/new",
    element: React.createElement(AdminNewJob),
    role: "Admin",
  },
  {
    path: "/admin/jobs/:id",
    element: React.createElement(AdminJobDetail),
    role: "Admin",
  },
  {
    path: "/manager/qa",
    element: React.createElement(QAReviewDashboardPage),
    role: "Manager",
  },
  {
    path: "/manager/qa/job/:jobId",
    element: React.createElement(QAReviewDetailPage),
    role: "Manager",
  },
  {
    path: "/manager/review",
    element: React.createElement(ManagerReview),
    role: "Manager",
  },
  {
    path: "/manager/inventory-alerts",
    element: React.createElement(InventoryAlertsPage),
    role: ["Manager", "Admin"],
    label: "Inventory Alerts",
  },
  {
    path: "/manager/archived",
    element: React.createElement(ArchivedJobsPage),
    role: ["Manager", "Admin"],
  },
  {
    path: "/archived",
    element: React.createElement(ArchivedJobsPage),
    role: ["Manager", "Admin"],
  },
  {
    path: "/install-manager",
    element: React.createElement(InstallManagerDashboard),
    role: ["Manager", "Admin"],
    label: "Install Manager Dashboard",
  },
  {
    path: "/install-manager/calendar",
    element: React.createElement(CalendarPage),
    role: ["Manager", "Admin"],
    label: "Schedule Calendar",
  },
  {
    path: "/install-manager/job/new",
    element: React.createElement(NewJobBuilderPage),
    role: ["Manager", "Admin"],
  },
  {
    path: "/install-manager/job/:id",
    element: React.createElement(UnderConstructionPage),
    role: ["Manager", "Admin"],
  },
  {
    path: "/install-manager/invoices/generate",
    element: React.createElement(InvoiceGenerator),
    role: ["Manager", "Admin"],
  },
  {
    path: "/install-manager/payments/log",
    element: React.createElement(PaymentLogger),
    role: ["Manager", "Admin"],
  },
  {
    path: "/clients",
    element: React.createElement(ClientsPage),
    role: ["Manager", "Admin"],
    label: "Clients",
  },
  {
    path: "/crm/leads",
    element: React.createElement(LeadsPage),
    role: ["Sales", "Manager", "Admin"],
    label: "Leads",
  },
  {
    path: "/sales/dashboard",
    element: React.createElement(SalesDashboard),
    role: ["Sales", "Manager", "Admin"],
    label: "Sales Dashboard",
  },
  {
    path: "/quotes",
    element: React.createElement(QuotesPage),
    role: ["Manager", "Admin"],
    label: "Quotes",
  },
  {
    path: "/invoices",
    element: React.createElement(InvoicesPage),
    role: ["Manager", "Admin"],
    label: "Invoices",
  },
  {
    path: "/invoices/:id",
    element: React.createElement(InvoiceDetailPage),
    role: ["Admin", "Finance"],
  },
  {
    path: "/payments",
    element: React.createElement(PaymentsPage),
    role: ["Manager", "Admin"],
    label: "Payments",
  },
  {
    path: "/messages",
    element: React.createElement(MessagesPanel),
    role: ["Manager", "Admin"],
    label: "Messages",
  },
  {
    path: "/time-tracking",
    element: React.createElement(TimeTrackingPanel),
    role: ["Manager", "Admin"],
    label: "Time Tracking",
  },
  {
    path: "/reports",
    element: React.createElement(ReportsPage),
    role: ["Manager", "Admin"],
    label: "Reports",
  },
  {
    path: "/reports/technician-pay",
    element: React.createElement(TechnicianPayReportPage),
    role: ["Admin", "Install Manager"],
    label: "Technician Pay",
  },
  {
    path: "/reports/invoice-aging",
    element: React.createElement(InvoiceAgingPage),
    role: ["Manager", "Admin"],
  },
  {
    path: "/admin/reports/payments",
    element: React.createElement(PaymentReportPage),
    role: ["Admin", "Finance"],
    label: "Payment Reports",
  },
];

export const navLinks = ROUTES.filter((r) => r.label);
