import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to ban/delete this user?")) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u.userId !== id));
        toast.success('User removed successfully');
      } catch (error) {
        console.error(error);
        toast.error('Failed to remove user');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-[#9A98C3]">Loading users...</div>;
  }

  return (
    <div className="p-8 text-[#E8E8FF]">
      <h1 className="text-3xl font-bold mb-2">User Management</h1>
      <p className="text-[#9A98C3] mb-8">Manage developer accounts and platform access.</p>
      
      <div className="bg-[#14122D] border border-[#2C2A4A] rounded-xl overflow-hidden shadow-2xl shadow-black/50 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#1E1C3A] border-b border-[#2C2A4A]">
              <th className="p-4 font-semibold text-[#9A98C3]">ID</th>
              <th className="p-4 font-semibold text-[#9A98C3]">User</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Email</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Role</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Joined</th>
              <th className="p-4 font-semibold text-[#9A98C3] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.userId} className="border-b border-[#2C2A4A]/50 hover:bg-[#1E1C3A]/50 transition-colors">
                <td className="p-4 text-[#9A98C3]">#{user.userId}</td>
                <td className="p-4 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    {user.username}
                  </div>
                </td>
                <td className="p-4 text-[#9A98C3]">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-[#9A98C3]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(user.userId)}
                    disabled={user.role === 'ADMIN'}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ban User
                  </button>
                </td>
              </tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-[#9A98C3]">
                  No users found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
