import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getProjectTree } from "../api/services/fileService";
import { getProjectById } from "../api/services/projectService";
import FileTree from "../components/editor/FileTree";
import CodeEditor from "../components/editor/CodeEditor";
import GlobalSearch from "../components/editor/GlobalSearch";
import { Files, Search, ArrowLeft } from "lucide-react";

export default function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');

  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("user")),
    [],
  );
  const userId = storedUser?.userId || storedUser?.id;

  const fetchTree = async () => {
    try {
      const res = await getProjectTree(projectId);
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to load file tree");
    }
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      try {
        const [treeRes, projRes] = await Promise.all([
          getProjectTree(projectId),
          getProjectById(projectId),
        ]);
        setFiles(treeRes.data);
        setProject(projRes.data);
      } catch (err) {
        toast.error("Failed to load environment");
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [projectId]);

  const isReadOnly = useMemo(() => {
    if (!project || !userId) return true;
    // Handle both cases: backend returning ownerId directly, or nested owner object
    const pOwnerId = project.ownerId || project.owner?.id;
    return String(pOwnerId) !== String(userId);
  }, [project, userId]);

  return (
    <div className="flex h-screen bg-[#070F2B] overflow-hidden">
{/* LEFT: Activity Bar */}
      <div className="w-12 border-r border-[#535C91]/30 bg-[#1B1A55]/40 flex flex-col items-center justify-between py-4 gap-4 z-10 flex-shrink-0">
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => setActiveTab('explore')}
            className={`p-2 rounded-xl transition-all ${activeTab === 'explore' ? 'bg-[#535C91]/50 text-white' : 'text-gray-400 hover:text-white hover:bg-[#535C91]/30'}`}
            title="Explorer"
          >
            <Files size={20} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`p-2 rounded-xl transition-all ${activeTab === 'search' ? 'bg-[#535C91]/50 text-white' : 'text-gray-400 hover:text-white hover:bg-[#535C91]/30'}`}
            title="Search"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-[#535C91]/30"
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* SECONDARY SIDEBAR */}
      <aside className="w-64 border-r border-[#535C91]/30 bg-[#1B1A55]/20 backdrop-blur-xl flex flex-col flex-shrink-0">
        {activeTab === 'explore' ? (
          <>
            <div className="p-4 border-b border-[#535C91]/30 flex-shrink-0">
              <h2 className="text-sm font-bold text-[#9290C3] uppercase tracking-widest">Explorer</h2>
            </div>
            <FileTree
              files={files}
              activeFile={activeFile}
              onFileClick={(file) => setActiveFile(file)}
              onRefresh={(deletedType, deletedId) => {
                fetchTree();
                if (deletedType && deletedId) {
                  if (deletedType === 'FILE' && activeFile?.id === `file-${deletedId}`) {
                    setActiveFile(null);
                  } else if (deletedType === 'FOLDER') {
                    setActiveFile(null);
                  }
                }
              }}
              projectId={projectId}
              readOnly={isReadOnly}
            />
          </>
        ) : (
          <>
            <div className="p-4 border-b border-[#535C91]/30 flex-shrink-0">
              <h2 className="text-sm font-bold text-[#9290C3] uppercase tracking-widest">Search</h2>
            </div>
            <GlobalSearch
              projectId={projectId}
              onFileSelect={(file) => setActiveFile(file)}
            />
          </>
        )}
      </aside>

      {/* RIGHT: Monaco Editor */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeFile ? (
          <CodeEditor
            key={activeFile.id}
            file={activeFile}
            readOnly={isReadOnly}
            userId={userId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a file to start coding</p>
          </div>
        )}
      </main>
    </div>
  );
}
