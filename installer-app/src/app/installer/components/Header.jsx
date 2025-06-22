import React from 'react';
import { FaBars } from 'react-icons/fa';

const Header = ({ title, onMenuClick, rightIcon = null, onRightIconClick }) => (
  <header className="bg-gray-900 text-white flex items-center justify-between px-4 py-3">
    <button
      aria-label="Open Menu"
      title="Open Menu"
      onClick={onMenuClick}
      className="text-2xl"
    >
      <FaBars />
    </button>
    <h1 className="text-lg font-semibold">{title}</h1>
    {rightIcon ? (
      <button
        aria-label="Header Action"
        title="Header Action"
        onClick={onRightIconClick}
        className="text-xl"
      >
        {rightIcon}
      </button>
    ) : (
      <div className="w-6" />
    )}
  </header>
);

export default Header;
