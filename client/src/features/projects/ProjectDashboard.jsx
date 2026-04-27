import { motion, AnimatePresence } from "framer-motion";
import { FolderOpenDot, Plus, Search, LogOut, Filter, X, Settings, Globe, LayoutGrid } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createProject,
  getOwnerProjects,
  getPublicProjects,
  searchProjects,
  getProjectsByLanguage,
} from "../../api/services/projectService";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import ProjectCard from "../../components/projects/ProjectCard";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import api from "../../api/axios";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ProjectDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-clusters"); // "my-clusters" or "explore"
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLang, setSelectedLang] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 400);

  const storedUser = useMemo(() => {
    try {
      const userRaw = localStorage.getItem("user");
      return userRaw ? JSON.parse(userRaw) : null;
    } catch { return null; }
  }, []);

  const userId = storedUser?.userId;
  const username = storedUser?.username || "Developer";
  const avatarUrl = storedUser?.avatarUrl;
  const [isSubscribed, setIsSubscribed] = useState(storedUser?.isSubscribed || false);

  useEffect(() => {
    const verifySubscription = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/payments/status/${userId}`);
        const sub = res.data.isSubscribed || res.data.active || res.data === true;
        setIsSubscribed(!!sub);
        localStorage.setItem('user', JSON.stringify({ ...storedUser, isSubscribed: !!sub }));
      } catch (err) {
        console.error(err);
      }
    };
    verifySubscription();
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Session cleared.");
    navigate("/login");
  };

  const fetchInitial = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let res;
      if (activeTab === "explore") {
        // Requirement: Public projects of all users visible 
        res = await getPublicProjects(userId);
      } else {
        // Only owner's projects (private + public) 
        res = await getOwnerProjects(userId);
      }
      setProjects(res.data);
    } catch (error) {
      toast.error("Sync failed.");
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab]);

  useEffect(() => {
    const handleSearch = async () => {
      setLoading(true);
      try {
        if (debouncedSearch.trim()) {
          const res = await searchProjects(debouncedSearch, userId);
          setProjects(res.data);
        } else if (selectedLang) {
          const res = await getProjectsByLanguage(selectedLang);
          setProjects(res.data);
        } else {
          await fetchInitial();
        }
      } catch (err) {
        toast.error("Discovery error.");
      } finally {
        setLoading(false);
      }
    };
    handleSearch();
  }, [debouncedSearch, selectedLang, userId, fetchInitial, activeTab]);

  async function handleCreateProject(formData) {
    if (!isSubscribed) {
      toast.error("Pro subscription required to create projects.");
      navigate("/profile", { state: { proRequired: true } });
      return;
    }
    setCreating(true);
    try {
      await createProject({ ...formData, ownerId: userId, ownerUsername: username });
      toast.success("Project created.");
      setIsModalOpen(false);
      fetchInitial();
    } catch (error) {
      toast.error("Failed to create.");
    } finally {
      setCreating(false);
    }
  }

  const handleCreateClick = () => {
    if (!isSubscribed) {
      toast.error("Pro subscription required to create projects.");
      navigate("/profile", { state: { proRequired: true } });
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#070F2B] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-6 rounded-3xl border border-[#535C91] bg-[#1B1A55]/40 p-8 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between shadow-2xl">
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="h-16 w-16 rounded-full object-cover shadow-lg border-2 border-[#9290C3]/50" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[#9290C3] flex items-center justify-center text-2xl font-bold text-[#070F2B] shadow-lg">
                {username[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">Repositories</h1>
              <p className="text-[#9290C3] opacity-80">Welcome back, @{username}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <button onClick={() => navigate("/settings")} className="p-3 rounded-xl border border-[#535C91] text-[#9290C3] hover:bg-[#1B1A55] transition-all">
                <Settings size={20} />
              </button>
              <button onClick={handleLogout} className="p-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={20} />
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCreateClick}
              className="px-6 py-3 rounded-xl bg-[#9290C3] text-[#070F2B] font-bold shadow-xl flex items-center gap-2"
            >
              <Plus size={20} /> Create New
            </motion.button>
          </div>
        </header>

        {/* Tab Switcher - Requirement: Differentiate My Projects vs Global Discovery */}
        <div className="flex gap-4 mb-8 bg-[#1B1A55]/30 p-1.5 rounded-2xl w-fit border border-[#535C91]/30 shadow-inner">
          <button 
            onClick={() => setActiveTab("my-clusters")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "my-clusters" ? "bg-[#9290C3] text-[#070F2B] shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            <LayoutGrid size={18} /> My Clusters
          </button>
          <button 
            onClick={() => setActiveTab("explore")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "explore" ? "bg-[#9290C3] text-[#070F2B] shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            <Globe size={18} /> Explore Public
          </button>
        </div>

        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#9290C3] transition-colors" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'explore' ? 'public' : 'your'} repositories...`}
              className="w-full rounded-2xl border border-[#535C91] bg-[#070F2B] py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-[#9290C3]" size={18} />
            <select
              className="rounded-2xl border border-[#535C91] bg-[#070F2B] px-6 py-3.5 text-white outline-none focus:ring-2 focus:ring-[#9290C3]/40 appearance-none min-w-[180px]"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              <option value="">All Technologies</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Rust">Rust</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton cards={6} />
        ) : projects.length === 0 ? (
          <div className="py-24 text-center rounded-[3rem] border-2 border-dashed border-[#535C91]/30">
            <FolderOpenDot className="mx-auto mb-6 h-20 w-20 text-[#535C91] opacity-50" />
            <h3 className="text-xl font-bold text-white">Empty Workspace</h3>
            <p className="text-gray-500">No clusters found in this view.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {projects.map((p, i) => (
                <ProjectCard key={p.projectId} project={p} index={i} onRefresh={fetchInitial} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        submitting={creating}
      />
    </main>
  );
}