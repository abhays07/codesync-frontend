import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Globe,
  Lock,
  Play,
  Trash2,
  Star,
  Archive,
  GitFork,
  AlertTriangle,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  deleteProject,
  starProject,
  archiveProject,
  forkProject,
} from "../../api/services/projectService";

export default function ProjectCard({ project, index = 0, onRefresh }) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isForking, setIsForking] = useState(false);

  const [isStarred, setIsStarred] = useState(!!project.isStarredByMe);
  const [starCount, setStarCount] = useState(project.starCount || 0);

  const isProcessing = useRef(false);

  const isPublic = (project.visibility || "").toUpperCase() === "PUBLIC";
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.userId;

  useEffect(() => {
    setIsStarred(!!project.isStarredByMe);
    setStarCount(project.starCount || 0);
  }, [project.projectId, project.isStarredByMe, project.starCount]);

  const handleStar = async (e) => {
    e.stopPropagation();
    if (isProcessing.current) return;

    isProcessing.current = true;
    const wasStarred = isStarred;

    setIsStarred(!wasStarred);
    setStarCount((prev) => (wasStarred ? Math.max(0, prev - 1) : prev + 1));

    try {
      await starProject(project.projectId, userId);
    } catch (err) {
      setIsStarred(wasStarred);
      setStarCount(project.starCount);
      toast.error("Failed to sync star status.");
    } finally {
      isProcessing.current = false;
    }
  };

  const handleFork = async (e) => {
    e.stopPropagation();
    if (isForking) return;

    // Requirement: Forking creates a personal copy of public project 
    const loadingId = toast.loading("Forking repository...");
    setIsForking(true);
    try {
      await forkProject(project.projectId, userId);
      toast.success("Project forked to your workspace!", { id: loadingId });
      onRefresh(); // Refresh to show new fork in "My Clusters"
    } catch (err) {
      toast.error("Forking failed.", { id: loadingId });
    } finally {
      setIsForking(false);
    }
  };

  const confirmDelete = async () => {
    const loadingId = toast.loading("Destroying repository...");
    try {
      await deleteProject(project.projectId);
      toast.success("Project removed.", { id: loadingId });
      setShowDeleteConfirm(false);
      onRefresh();
    } catch (err) {
      toast.error("Deletion failed.", { id: loadingId });
    }
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group relative overflow-hidden rounded-2xl border border-[#535C91] bg-[#1B1A55]/80 p-5 backdrop-blur-lg ${project.isArchived ? "opacity-60" : ""}`}
        whileHover={{ scale: 1.015 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center justify-center rounded-lg border border-[#535C91] bg-[#070F2B]/80 p-2 text-[#9290C3]">
            <Folder className="h-4 w-4" />
          </span>

          <div className="inline-flex items-center gap-1 bg-[#070F2B]/40 p-1 rounded-lg border border-[#535C91]/30 shadow-inner">
            <button
              onClick={handleStar}
              className={`p-1.5 transition-all rounded-md ${isStarred ? "text-yellow-400 bg-yellow-400/10" : "text-gray-400 hover:text-yellow-400"}`}
              title={isStarred ? "Unstar" : "Star"}
            >
              <Star
                className={`h-4 w-4 ${isStarred ? "fill-yellow-400" : ""}`}
              />
            </button>

            {/* Requirement: Fork only available for Public projects not owned by user */}
            {isPublic && project.ownerId !== userId && (
              <button
                disabled={isForking}
                onClick={handleFork}
                className="p-1.5 text-gray-400 hover:text-[#9290C3] transition-colors disabled:opacity-50"
                title="Fork Project"
              >
                <GitFork
                  className={`h-4 w-4 ${isForking ? "animate-pulse" : ""}`}
                />
              </button>
            )}

            {/* Archive button visible for owners  */}
            {project.ownerId === userId && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await archiveProject(project.projectId);
                  onRefresh();
                }}
                className={`p-1.5 transition-colors ${project.isArchived ? "text-orange-400 bg-orange-400/10" : "text-gray-400 hover:text-white"}`}
                title={project.isArchived ? "Unarchive" : "Archive"}
              >
                <Archive className="h-4 w-4" />
              </button>
            )}

            {/* Delete button restricted to owners  */}
            {project.ownerId === userId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#535C91] bg-[#070F2B]/70 px-2.5 py-1 text-[10px] font-bold uppercase text-gray-200">
            {isPublic ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            {project.visibility}
          </span>
          <span className="rounded-md bg-[#070F2B] px-2 py-1 text-xs text-[#9290C3] font-mono">
            {project.language}
          </span>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-white truncate">
          {project.name}
        </h3>
        <p className="line-clamp-2 text-sm text-gray-300 min-h-[40px] leading-relaxed">
          {project.description || "No description provided."}
        </p>

        <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-t border-[#535C91]/20 pt-4">
          <span
            className={`flex items-center gap-1.5 transition-colors duration-300 ${isStarred ? "text-yellow-400" : ""}`}
          >
            <Star className={`h-3 w-3 ${isStarred ? "fill-yellow-400" : ""}`} />{" "}
            {starCount}
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork className="h-3 w-3" /> {project.forkCount || 0}
          </span>
        </div>

        <motion.button
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#9290C3] py-2.5 text-sm font-bold text-[#070F2B] shadow-lg transition group-hover:bg-white"
          onClick={() => navigate(`/editor/${project.projectId}`)}
        >
          <Play className="h-4 w-4 fill-current" /> Launch Editor
        </motion.button>
      </motion.article>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm rounded-3xl border border-red-500/40 bg-[#1B1A55] p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Delete Cluster?
                </h2>
                <p className="mb-8 text-gray-400 text-sm">
                  Permanently destroy{" "}
                  <span className="font-mono text-white">{project.name}</span>?
                  This is irreversible.
                </p>
                <div className="flex w-full flex-col gap-3">
                  <button
                    onClick={confirmDelete}
                    className="w-full rounded-2xl bg-red-600 py-3.5 font-bold text-white hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-900/20"
                  >
                    Yes, Purge Project
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full rounded-2xl bg-transparent py-3.5 font-bold text-gray-400 border border-[#535C91] hover:bg-[#535C91]/20 transition-all"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
