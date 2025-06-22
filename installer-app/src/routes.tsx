import React from 'react';

// Page components
import InstallerHomePage from './installer/pages/InstallerHomePage';
import InstallerAppointmentPage from './app/appointments/InstallerAppointmentPage';
import ActivityLogPage from './app/activity/ActivityLogPage';
import JobDetailPage from './installer/pages/JobDetailPage';
import IFIDashboard from './installer/pages/IFIDashboard';
import MockJobsPage from './installer/pages/MockJobsPage';
import FeedbackPage from './installer/pages/FeedbackPage';
import InstallManagerDashboard from './app/install-manager/page.jsx';
import AdminDashboard from './app/admin/AdminDashboard';
import SalesDashboard from './app/sales/SalesDashboard';
import NewJobBuilderPage from './app/install-manager/job/NewJobBuilderPage';
import AdminNewJob from './app/admin/jobs/AdminNewJob';
import AdminJobDetail from './app/admin/jobs/JobDetailPage';
import InstallerDashboard from './app/installer/InstallerDashboard';
import InstallerJobPage from './app/installer/jobs/InstallerJobPage';
import InstallerProfilePage from './app/installer/profile/InstallerProfilePage';
import QAReviewDashboardPage from './app/manager/QAReviewDashboardPage';
import QAReviewDetailPage from './app/manager/QAReviewDetailPage';
import ManagerReview from './app/manager/ManagerReview';
import ArchivedJobsPage from './app/archived/ArchivedJobsPage';
import InventoryPage from './app/installer/InventoryPage';
import JobHistoryPage from './app/installer/JobHistoryPage';
import ClientsPage from './app/clients/ClientsPage';
import QuotesPage from './app/quotes/QuotesPage';
import InvoicesPage from './app/invoices/InvoicesPage';
import InvoiceDetailPage from './app/invoices/InvoiceDetailPage';
import PaymentsPage from './app/payments/PaymentsPage';
import InvoiceGenerator from './app/install-manager/InvoiceGenerator';
import PaymentLogger from './app/install-manager/PaymentLogger';
import MessagesPanel from './app/messages/MessagesPanel';
import TimeTrackingPanel from './app/time-tracking/TimeTrackingPanel';
import ReportsPage from './app/reports/ReportsPage';
import TechnicianPayReportPage from './app/reports/TechnicianPayReportPage';
import InvoiceAgingPage from './app/reports/InvoiceAgingPage';
import LeadsPage from './app/crm/LeadsPage';
import PaymentReportPage from './app/admin/reports/payments/PaymentReportPage';
import UnderConstructionPage from './app/UnderConstructionPage';
import LoginPage from './app/login/LoginPage';

export type RouteConfig = {
  path: string;
  element: React.ReactElement;
  role?: string | string[];
  label?: string;
};

export const ROUTES: RouteConfig[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <InstallerHomePage />, role: 'Installer', label: 'Home' },
  { path: '/appointments', element: <InstallerAppointmentPage />, role: 'Installer', label: 'Appointment Summary' },
  { path: '/activity', element: <ActivityLogPage />, role: 'Installer', label: 'Activity Summary' },
  { path: '/ifi', element: <IFIDashboard />, role: 'Installer', label: 'IFI Dashboard' },
  { path: '/job/:jobId', element: <JobDetailPage />, role: 'Installer' },
  { path: '/mock-jobs', element: <MockJobsPage />, role: 'Installer' },
  { path: '/installer', element: <InstallerDashboard />, role: 'Installer', label: 'Installer Dashboard' },
  { path: '/installer/dashboard', element: <InstallerDashboard />, role: 'Installer' },
  { path: '/installer/jobs/:id', element: <InstallerJobPage />, role: 'Installer' },
  { path: '/installer/profile', element: <InstallerProfilePage />, role: 'Installer' },
  { path: '/installer/inventory', element: <InventoryPage />, role: 'Installer' },
  { path: '/installer/history', element: <JobHistoryPage />, role: 'Installer' },
  { path: '/feedback', element: <FeedbackPage />, role: 'Installer', label: 'Feedback' },
  { path: '/admin/dashboard', element: <AdminDashboard />, role: 'Admin', label: 'Admin Dashboard' },
  { path: '/admin/jobs/new', element: <AdminNewJob />, role: 'Admin' },
  { path: '/admin/jobs/:id', element: <AdminJobDetail />, role: 'Admin' },
  { path: '/manager/qa', element: <QAReviewDashboardPage />, role: 'Manager' },
  { path: '/manager/qa/job/:jobId', element: <QAReviewDetailPage />, role: 'Manager' },
  { path: '/manager/review', element: <ManagerReview />, role: 'Manager' },
  { path: '/manager/archived', element: <ArchivedJobsPage />, role: ['Manager', 'Admin'] },
  { path: '/archived', element: <ArchivedJobsPage />, role: ['Manager', 'Admin'] },
  { path: '/install-manager', element: <InstallManagerDashboard />, role: ['Manager', 'Admin'], label: 'Install Manager Dashboard' },
  { path: '/install-manager/dashboard', element: <InstallManagerDashboard />, role: ['Manager', 'Admin'] },
  { path: '/install-manager/job/new', element: <NewJobBuilderPage />, role: ['Manager', 'Admin'] },
  { path: '/install-manager/job/:id', element: <UnderConstructionPage />, role: ['Manager', 'Admin'] },
  { path: '/install-manager/invoices/generate', element: <InvoiceGenerator />, role: ['Manager', 'Admin'] },
  { path: '/install-manager/payments/log', element: <PaymentLogger />, role: ['Manager', 'Admin'] },
  { path: '/clients', element: <ClientsPage />, role: ['Manager', 'Admin'], label: 'Clients' },
  { path: '/crm/leads', element: <LeadsPage />, role: ['Sales', 'Manager', 'Admin'], label: 'Leads' },
  { path: '/sales/dashboard', element: <SalesDashboard />, role: ['Sales', 'Manager', 'Admin'], label: 'Sales Dashboard' },
  { path: '/quotes', element: <QuotesPage />, role: ['Manager', 'Admin'], label: 'Quotes' },
  { path: '/invoices', element: <InvoicesPage />, role: ['Manager', 'Admin'], label: 'Invoices' },
  { path: '/invoices/:id', element: <InvoiceDetailPage />, role: ['Admin', 'Finance'] },
  { path: '/payments', element: <PaymentsPage />, role: ['Manager', 'Admin'], label: 'Payments' },
  { path: '/messages', element: <MessagesPanel />, role: ['Manager', 'Admin'], label: 'Messages' },
  { path: '/time-tracking', element: <TimeTrackingPanel />, role: ['Manager', 'Admin'], label: 'Time Tracking' },
  { path: '/reports', element: <ReportsPage />, role: ['Manager', 'Admin'], label: 'Reports' },
  { path: '/reports/technician-pay', element: <TechnicianPayReportPage />, role: ['Admin', 'Install Manager'], label: 'Technician Pay' },
  { path: '/reports/invoice-aging', element: <InvoiceAgingPage />, role: ['Manager', 'Admin'] },
  { path: '/admin/reports/payments', element: <PaymentReportPage />, role: ['Admin', 'Finance'], label: 'Payment Reports' },
];

export const navLinks = ROUTES.filter((r) => r.label);

