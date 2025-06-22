import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';

const checklistItems = [
  'Mount hardware',
  'Connect wiring',
  'Verify power',
  'Run diagnostics',
  'Submit photos',
];

const ChecklistModal = ({ isOpen, onClose }) => {
  const [checks, setChecks] = useState(() => checklistItems.map(() => false));

  useEffect(() => {
    if (isOpen) {
      setChecks(checklistItems.map(() => false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCheck = (index) => {
    setChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const allChecked = checks.every(Boolean);

  const handleComplete = () => {
    if (allChecked) {
      onClose();
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Installation Checklist</h2>
      <ul className="space-y-2 mb-4">
          {checklistItems.map((item, idx) => (
            <li key={idx} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`chk-${idx}`}
                checked={checks[idx]}
                onChange={() => toggleCheck(idx)}
                className="form-checkbox text-green-600 h-5 w-5"
              />
              <label htmlFor={`chk-${idx}`} className={checks[idx] ? 'line-through text-green-600' : ''}>
                {item}
              </label>
            </li>
          ))}
      </ul>
      <div className="text-right space-x-2">
        <button
          onClick={handleComplete}
          disabled={!allChecked}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Mark Complete
        </button>
      </div>
    </ModalWrapper>
  );
};

export default ChecklistModal;
