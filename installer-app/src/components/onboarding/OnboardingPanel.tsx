import React from "react";
import { Link } from "react-router-dom";
import useOnboardingStatus from "../../lib/hooks/useOnboardingStatus";
import { useAuth } from "../../lib/hooks/useAuth";

const tasksByRole: Record<string, { id: string; label: string; to: string }[]> =
  {
    Admin: [
      { id: "company-profile", label: "Set up Company Profile", to: "#" },
      { id: "add-team", label: "Add Team Member", to: "#" },
      { id: "service-types", label: "Define Service Types", to: "/quotes/new" },
      { id: "view-kpis", label: "View KPIs", to: "/admin/dashboard" },
    ],
    Sales: [
      { id: "add-lead", label: "Add Lead", to: "/crm/leads" },
      { id: "create-quote", label: "Create Quote", to: "/quotes/new" },
      { id: "open-crm", label: "Open CRM Pipeline", to: "/crm/leads" },
    ],
    Manager: [
      { id: "view-jobs", label: "View Jobs", to: "/install-manager/dashboard" },
      { id: "review-quotes", label: "Review Quotes", to: "/quotes" },
      { id: "payroll", label: "Generate Payroll Report", to: "/reports" },
    ],
    Installer: [
      {
        id: "assigned-jobs",
        label: "View Assigned Jobs",
        to: "/installer/dashboard",
      },
      { id: "test-job", label: "Complete Test Job", to: "/mock-jobs" },
      { id: "log-materials", label: "Log Materials", to: "/installer/jobs/1" },
    ],
  };

const OnboardingPanel: React.FC = () => {
  const { role, user } = useAuth();
  const { status, markComplete, dismiss, progress } = useOnboardingStatus();

  if (!role || !user) return null;
  if (status && status.dismissedAt) return null;

  const tasks = tasksByRole[role] || [];
  const completed = new Set(status?.completedTasks ?? []);
  const doneCount = [...completed].length;

  if (doneCount >= tasks.length) return null;

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-lg">
          Welcome, {user.user_metadata?.full_name || user.email}! Let’s get you
          set up.
        </h2>
        <button onClick={dismiss} className="text-sm text-gray-500">
          Dismiss
        </button>
      </div>
      <div className="mb-2 text-sm text-gray-600">
        {doneCount}/{tasks.length} tasks complete
      </div>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={completed.has(t.id)}
              onChange={() => markComplete(t.id)}
              className="h-4 w-4"
            />
            <Link to={t.to} className="text-green-600 hover:underline">
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingPanel;
