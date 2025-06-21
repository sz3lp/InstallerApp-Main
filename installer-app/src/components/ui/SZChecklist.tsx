import React from "react";

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  onToggle?: (id: string, completed: boolean) => void;
}

export interface SZChecklistProps {
  items: ChecklistItem[];
  className?: string;
}

export const SZChecklist: React.FC<SZChecklistProps> = ({
  items,
  className = "",
}) => {
  return (
    <ul className={`space-y-2 ${className}`.trim()}>
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => item.onToggle?.(item.id, !item.completed)}
            className="form-checkbox text-green-600 h-5 w-5"
          />
          <span className={item.completed ? "line-through text-green-600" : ""}>
            {item.description}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default SZChecklist;
