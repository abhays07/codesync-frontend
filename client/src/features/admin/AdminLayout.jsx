import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Users, Settings, Database, CreditCard } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#0B0A1A]">
      {/* Sidebar */}
      <div className="w-64 bg-[#14122D] border-r border-[#2C2A4A] p-4 flex flex-col">
        <h2 className="text-[#E8E8FF] text-xl font-bold mb-8 pl-4">Admin Console</h2>
        <nav className="flex-1 space-y-2">
          <NavLink
            to="/admin/users"
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
