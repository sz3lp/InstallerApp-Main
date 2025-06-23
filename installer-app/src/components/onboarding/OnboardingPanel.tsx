import React from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import useOnboardingState from "../../lib/hooks/useOnboardingState";

const TASKS_BY_ROLE: Record<string, { id: string; label: string }[]> = {
  Admin: [{ id: "admin_invited_user", label: "Invite a User" }],
  Sales: [{ id: "sales_created_quote", label: "Create a Quote" }],
  Manager: [{ id: "manager_reviewed_job", label: "Review a Job" }],
  Installer: [{ id: "installer_started_job", label: "Start a Job" }],
};

interface Props {
  role: "Installer" | "Sales" | "Manager" | "Admin";
  userId: string;
}

const OnboardingPanel: React.FC<Props> = ({ role, userId }) => {
  const { user } = useAuth();
  const { completedTasks, dismissed, completeTask, dismiss } =
    useOnboardingState(userId);

  if (!userId) return null;
  const tasks = TASKS_BY_ROLE[role] || [];
  const allDone = tasks.every((t) => completedTasks.includes(t.id));

  if (dismissed || allDone || tasks.length === 0) return null;

  const name = user?.full_name?.split(" ")[0] || "User";
  return (
    <div className="p-4 mb-4 border rounded bg-yellow-50">
      <div className="flex justify-between mb-2">
        <div>
          <h2 className="font-semibold">{`Welcome, ${name}! Let's get you set up as a ${role}.`}</h2>
          <p className="text-sm text-gray-600">{`${completedTasks.length} of ${tasks.length} tasks completed`}</p>
        </div>
        <button onClick={dismiss} className="text-sm text-gray-500">
          Dismiss Forever
        </button>
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
                onChange={() => !done && completeTask(task.id as any)}
              />
              <span className={done ? "line-through text-gray-600" : ""}>
                {task.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OnboardingPanel;
