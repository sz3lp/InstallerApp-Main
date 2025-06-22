import React from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import useOnboardingState from '../../lib/hooks/useOnboardingState';

const TASKS_BY_ROLE: Record<string, { id: string; label: string; link: string }[]> = {
  Admin: [
    { id: 'setup_company', label: 'Set up Company Profile', link: '/settings' },
    { id: 'add_team_member', label: 'Add Your First Team Member', link: '/admin/users' },
    { id: 'define_services', label: 'Define Service Types', link: '/admin/catalog' },
    { id: 'review_kpis', label: "Review Today's KPIs", link: '/admin/dashboard' },
  ],
  Sales: [
    { id: 'add_lead', label: 'Add Your First Lead', link: '/crm/leads' },
    { id: 'create_quote', label: 'Create Your First Quote', link: '/quotes' },
    { id: 'explore_crm', label: 'Explore the CRM Pipeline', link: '/crm/leads' },
  ],
  Manager: [
    { id: 'review_jobs', label: 'Review Jobs in Progress', link: '/install-manager/dashboard' },
    { id: 'approve_quotes', label: 'Approve Pending Quotes', link: '/quotes' },
    { id: 'payroll_report', label: 'Generate Payroll Report', link: '/reports' },
  ],
  Installer: [
    { id: 'view_jobs', label: 'View Your Assigned Jobs', link: '/installer/dashboard' },
    { id: 'complete_test_job', label: 'Complete First Job (Test)', link: '/installer/jobs/mock' },
    { id: 'log_materials', label: 'Log Materials for a Job', link: '/installer/inventory' },
  ],
};

interface Props {
  role: string | null;
  userId: string | null;
}

const OnboardingPanel: React.FC<Props> = ({ role, userId }) => {
  const { user } = useAuth();
  const { completedTasks, dismissed, completeTask, dismiss } = useOnboardingState(userId);

  if (!role || !userId) return null;
  const tasks = TASKS_BY_ROLE[role] || [];
  const allDone = tasks.every((t) => completedTasks.includes(t.id));

  if (dismissed || allDone || tasks.length === 0) return null;

  const name = user?.full_name?.split(' ')[0] || 'User';
  return (
    <div className="p-4 mb-4 border rounded bg-yellow-50">
      <div className="flex justify-between mb-2">
        <div>
          <h2 className="font-semibold">{`Welcome, ${name}! Let's get you set up as a ${role}.`}</h2>
          <p className="text-sm text-gray-600">{`${completedTasks.length} of ${tasks.length} tasks completed`}</p>
        </div>
        <button onClick={dismiss} className="text-sm text-gray-500">Dismiss</button>
      </div>
      <ul className="space-y-1">
        {tasks.map((task) => {
          const done = completedTasks.includes(task.id);
          return (
            <li key={task.id} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={done}
                onChange={() => !done && completeTask(task.id)}
              />
              <a
                href={task.link}
                className={`hover:underline ${done ? 'line-through text-gray-600' : ''}`}
              >
                {task.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OnboardingPanel;
