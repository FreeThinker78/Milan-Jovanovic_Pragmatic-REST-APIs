import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? 'bg-gray-100' : '';
  };

  return (
    <aside
      className={`fixed left-0 top-[57px] h-[calc(100vh-57px)] bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-4">
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className={`block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive('/dashboard')}`}
          >
            Dashboard
          </Link>
          <Link
            to="/habits"
            className={`block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive('/habits')}`}
          >
            My Habits
          </Link>
          <Link
            to="/entries"
            className={`block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive('/entries')}`}
          >
            My Entries
          </Link>
          <Link
            to="/tags"
            className={`block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive('/tags')}`}
          >
            My Tags
          </Link>
        </nav>
      </div>
    </aside>
  );
};
