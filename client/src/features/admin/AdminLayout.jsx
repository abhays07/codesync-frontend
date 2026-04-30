import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Users, Settings, Database, CreditCard, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0B0A1A] relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#14122D] border-b border-[#2C2A4A] p-4 flex items-center justify-between sticky top-0 z-20">
        <h2 className="text-[#E8E8FF] text-xl font-bold">Admin Console</h2>
        <button onClick={toggleSidebar} className="text-[#9A98C3] hover:text-white">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 md:top-auto z-30
        w-64 bg-[#14122D] border-r border-[#2C2A4A] flex flex-col h-full md:h-auto
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex items-center justify-between md:block">
          <h2 className="text-[#E8E8FF] text-xl font-bold mb-4 md:mb-8 pl-4 hidden md:block">Admin Console</h2>
          <h2 className="text-[#E8E8FF] text-xl font-bold md:hidden pl-4">Menu</h2>
          <button onClick={closeSidebar} className="md:hidden text-[#9A98C3] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          <NavLink
            to="/admin/users"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-[#9A98C3] hover:bg-[#1E1C3A] hover:text-[#E8E8FF]'
              }`
            }
          >
            <Users size={20} />
            Users
          </NavLink>
          
          <NavLink
            to="/admin/projects"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-[#9A98C3] hover:bg-[#1E1C3A] hover:text-[#E8E8FF]'
              }`
            }
          >
            <Database size={20} />
            Projects
          </NavLink>
          
          <NavLink
            to="/admin/subscriptions"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-[#9A98C3] hover:bg-[#1E1C3A] hover:text-[#E8E8FF]'
              }`
            }
          >
            <CreditCard size={20} />
            Subscriptions
          </NavLink>
          
          <NavLink
            to="/admin/settings"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-[#9A98C3] hover:bg-[#1E1C3A] hover:text-[#E8E8FF]'
              }`
            }
          >
            <Settings size={20} />
            System Settings
          </NavLink>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[#0B0A1A]">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
