import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const ModalWrapper = ({ isOpen, onClose, children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (container) {
      container.focus();
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        const focusable = container.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />
      <div
        ref={containerRef}
        tabIndex="-1"
        className="bg-white p-6 rounded shadow max-w-md w-full relative focus:outline-none"
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600"
        >
          <FaTimes />
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;
