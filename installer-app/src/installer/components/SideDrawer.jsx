import React from 'react';
import { Link } from 'react-router-dom';
import { navLinks } from '../../navConfig';

const SideDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />
      <div className="absolute top-0 left-0 w-64 h-full bg-white shadow z-50 p-4">
        <button onClick={onClose} className="text-gray-600 mb-4">
          Close
        </button>
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.path}>
              {link.path.startsWith('/') ? (
                <Link to={link.path} onClick={onClose} className="block">
                  {link.label}
                </Link>
              ) : (
                <a href={link.path} className="block" onClick={onClose}>
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SideDrawer;
