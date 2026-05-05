import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Shield, Server, Bell, Key } from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    platformName: 'CodeSync Platform',
    maintenanceMode: false,
    allowRegistration: true,
    maxProjectsPerUser: 5,
    sessionTimeout: 60,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('System settings updated successfully!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-8 text-[#E8E8FF] max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-[#9A98C3]">Configure global platform parameters and security policies.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-[#14122D] border border-[#2C2A4A] rounded-xl overflow-hidden shadow-xl">
          <div className="bg-[#1E1C3A] border-b border-[#2C2A4A] p-4 flex items-center gap-3">
            <Server className="text-blue-400" size={20} />
            <h2 className="font-semibold">General Configuration</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#9A98C3] mb-2">Platform Name</label>
                <input 
                  type="text" 
                  value={settings.platformName}
                  onChange={e => setSettings({...settings, platformName: e.target.value})}
                  className="w-full bg-[#0B0A1A] border border-[#2C2A4A] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9A98C3] mb-2">Max Projects Per User (Free Tier)</label>
                <input 
                  type="number" 
                  value={settings.maxProjectsPerUser}
                  onChange={e => setSettings({...settings, maxProjectsPerUser: parseInt(e.target.value)})}
                  className="w-full bg-[#0B0A1A] border border-[#2C2A4A] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="pt-4 flex items-center justify-between border-t border-[#2C2A4A]">
              <div>
                <h3 className="font-medium">Maintenance Mode</h3>
                <p className="text-sm text-[#9A98C3]">Disable access to all non-admin users.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.maintenanceMode}
                  onChange={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                />
                <div className="w-11 h-6 bg-[#2C2A4A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[#14122D] border border-[#2C2A4A] rounded-xl overflow-hidden shadow-xl">
          <div className="bg-[#1E1C3A] border-b border-[#2C2A4A] p-4 flex items-center gap-3">
            <Shield className="text-green-400" size={20} />
            <h2 className="font-semibold">Security & Access</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#9A98C3] mb-2">JWT Session Timeout (Minutes)</label>
                <input 
                  type="number" 
                  value={settings.sessionTimeout}
                  onChange={e => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  className="w-full bg-[#0B0A1A] border border-[#2C2A4A] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="pt-4 flex items-center justify-between border-t border-[#2C2A4A]">
              <div>
                <h3 className="font-medium">Allow New Registrations</h3>
                <p className="text-sm text-[#9A98C3]">Permit new users to sign up for the platform.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.allowRegistration}
                  onChange={() => setSettings({...settings, allowRegistration: !settings.allowRegistration})}
                />
                <div className="w-11 h-6 bg-[#2C2A4A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* API Gateway Integrations */}
        <div className="bg-[#14122D] border border-[#2C2A4A] rounded-xl overflow-hidden shadow-xl opacity-75">
          <div className="bg-[#1E1C3A] border-b border-[#2C2A4A] p-4 flex items-center gap-3">
            <Key className="text-purple-400" size={20} />
            <h2 className="font-semibold">API Integrations (Read-only)</h2>
          </div>
          <div className="p-6 space-y-4 text-[#9A98C3] text-sm">
            <p>These settings are managed via Jenkins Environment Variables.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-[#0B0A1A] p-3 rounded border border-[#2C2A4A]">
                <span className="font-mono text-xs text-blue-400">RAZORPAY_KEY_ID</span>
                <div className="mt-1">rzp_test_****************</div>
              </div>
              <div className="bg-[#0B0A1A] p-3 rounded border border-[#2C2A4A]">
                <span className="font-mono text-xs text-blue-400">GITHUB_CLIENT_ID</span>
                <div className="mt-1">Ov23li2ujEtec6Mu4BdF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
