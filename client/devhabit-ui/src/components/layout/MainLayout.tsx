import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Sidebar } from './Sidebar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar onMenuClick={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`flex-1 overflow-auto p-6 transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
