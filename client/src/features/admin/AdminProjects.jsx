import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/admin/projects');
      setProjects(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-[#9A98C3]">Loading projects...</div>;

  return (
    <div className="p-8 text-[#E8E8FF]">
      <h1 className="text-3xl font-bold mb-2">Project Overview</h1>
      <p className="text-[#9A98C3] mb-8">View and manage all projects across the platform.</p>
      
      <div className="bg-[#14122D] border border-[#2C2A4A] rounded-xl overflow-hidden shadow-2xl shadow-black/50 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#1E1C3A] border-b border-[#2C2A4A]">
              <th className="p-4 font-semibold text-[#9A98C3]">ID</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Title</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Language</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Owner ID</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Created At</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} className="border-b border-[#2C2A4A]/50 hover:bg-[#1E1C3A]/50 transition-colors">
                <td className="p-4 text-[#9A98C3]">#{project.id}</td>
                <td className="p-4 font-medium text-blue-400">{project.title}</td>
                <td className="p-4 text-[#9A98C3] uppercase">{project.language}</td>
                <td className="p-4 text-[#9A98C3]">#{project.ownerId}</td>
                <td className="p-4 text-[#9A98C3]">
                  {new Date(project.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            
            {projects.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[#9A98C3]">
                  No projects found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProjects;
