import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  File,
  Plus,
  Trash2,
  FolderPlus,
  Edit,
  Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createFile,
  createFolder,
  deleteFile,
  deleteFolder,
  renameFile as renameFileApi,
  renameFolder as renameFolderApi,
} from "../../api/services/fileService";

export default function FileTree({ files, activeFile, onFileClick, onRefresh, projectId, readOnly }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [renamingNode, setRenamingNode] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef(null);

  useEffect(() => {
    if (renamingNode && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingNode]);

  const toggleFolder = (folderId) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(folderId)) newSet.delete(folderId);
    else newSet.add(folderId);
    setExpandedFolders(newSet);
  };

  const handleAddFile = async (folderId = null) => {
    if (readOnly) return;
    const fileName = prompt("Enter file name (e.g. index.js):");
    if (!fileName) return;

    try {
      await createFile({
        name: fileName,
        projectId: projectId,
        folderId: folderId,
        content: "// Start coding here",
        extension: fileName.split(".").pop(),
      });
      toast.success("File created!");
      if (folderId) {
          const newSet = new Set(expandedFolders);
          newSet.add(`folder-${folderId}`);
          setExpandedFolders(newSet);
      }
      onRefresh();
    } catch (err) {
      toast.error("Failed to create file");
    }
  };

  const handleAddFolder = async (parentFolderId = null) => {
    if (readOnly) return;
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      await createFolder({
        name: folderName,
        projectId: projectId,
        parentFolderId: parentFolderId,
      });
      toast.success("Folder created!");
      if (parentFolderId) {
          const newSet = new Set(expandedFolders);
          newSet.add(`folder-${parentFolderId}`);
          setExpandedFolders(newSet);
      }
      onRefresh();
    } catch (err) {
      toast.error("Failed to create folder");
    }
  };

  const handleDelete = async (e, node) => {
    e.stopPropagation();
    if (readOnly) return;
    const isFolder = node.type === "FOLDER";
    const typeLabel = isFolder ? "folder and all its contents" : "file";
    
    if (!window.confirm(`Are you sure you want to delete this ${typeLabel}?`)) return;

    const loadingId = toast.loading("Deleting...");
    try {
      const numericId = node.id.split("-")[1];

      if (!isFolder) {
        await deleteFile(numericId);
        toast.success("File deleted", { id: loadingId });
        onRefresh('FILE', numericId); 
      } else {
        await deleteFolder(numericId);
        toast.success("Folder deleted", { id: loadingId });
        onRefresh('FOLDER', numericId);
      }
    } catch (err) {
      toast.error("Delete failed", { id: loadingId });
    }
  };

  const handleRename = (e, node) => {
    e.stopPropagation();
    if (readOnly) return;
    setRenamingNode(node.id);
    setRenameValue(node.name);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renamingNode || !renameValue) {
      setRenamingNode(null);
      return;
    }

    const loadingId = toast.loading("Renaming...");
    try {
      const type = renamingNode.split("-")[0];
      const numericId = renamingNode.split("-")[1];
      
      if (type === "folder") {
        await renameFolderApi(numericId, renameValue);
      } else {
        await renameFileApi(numericId, renameValue);
      }
      
      toast.success("Renamed successfully", { id: loadingId });
      onRefresh();
    } catch (err) {
      toast.error("Rename failed", { id: loadingId });
    } finally {
      setRenamingNode(null);
      setRenameValue("");
    }
  };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['json'].includes(ext)) return <FileJson size={14} className="text-yellow-400" />;
    if (['md', 'txt'].includes(ext)) return <FileText size={14} className="text-gray-300" />;
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return <FileCode size={14} className="text-yellow-300" />;
    if (['html', 'css', 'java', 'xml'].includes(ext)) return <FileCode size={14} className="text-blue-400" />;
    if (['png', 'jpg', 'jpeg', 'svg'].includes(ext)) return <ImageIcon size={14} className="text-purple-400" />;
    return <File size={14} className="text-gray-400" />;
  };

  const renderTree = (nodes, depth = 0) => {
    const sortedNodes = [...nodes].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'FOLDER' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return sortedNodes.map((node) => {
      const isFolder = node.type === "FOLDER";
      const isExpanded = expandedFolders.has(node.id);
      const isActive = activeFile?.id === node.id;

      return (
        <div key={node.id} className="select-none flex flex-col">
          <div
            className={`flex items-center justify-between group py-[3px] cursor-pointer transition-colors ${
              isActive 
                ? "bg-[#535C91]/50 text-white" 
                : "hover:bg-[#535C91]/30 text-gray-300"
            }`}
            style={{ paddingLeft: `${depth * 12 + 12}px`, paddingRight: '8px' }}
            onClick={(e) => {
              e.stopPropagation();
              if (isFolder) toggleFolder(node.id);
              else onFileClick(node);
            }}
          >
            {renamingNode === node.id ? (
              <form onSubmit={handleRenameSubmit} className="flex-grow flex items-center pr-2">
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#2D3250] text-white text-sm px-1 py-0.5 rounded border border-blue-500 w-full outline-none"
                />
              </form>
            ) : (
              <>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className="flex-shrink-0 w-4 flex justify-center items-center">
                    {isFolder && (isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />)}
                  </div>
                  
                  {isFolder ? (
                    isExpanded ? <FolderOpen size={15} className="text-blue-400" /> : <Folder  size={15} className="text-blue-400 fill-blue-400/20" />
                  ) : (
                    getFileIcon(node.name)
                  )}
                  <span className={`text-sm truncate font-medium ${isActive ? "text-blue-100" : ""}`}>{node.name}</span>
                </div>

                <div className="hidden group-hover:flex items-center gap-1 ml-2">
                  {!readOnly && (
                    <>
                      {isFolder && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleAddFile(node.id.split("-")[1]); }} title="New File" className="p-1 hover:bg-[#535C91] rounded text-gray-400 hover:text-white transition-colors">
                            <Plus size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleAddFolder(node.id.split("-")[1]); }} title="New Folder" className="p-1 hover:bg-[#535C91] rounded text-gray-400 hover:text-white transition-colors">
                            <FolderPlus size={14} />
                          </button>
                        </>
                      )}
                       <button onClick={(e) => handleRename(e, node)} title="Rename" className="p-1 hover:bg-[#535C91] rounded text-gray-400 hover:text-white transition-colors">
                        <Edit size={14} />
                       </button>
                      <button onClick={(e) => handleDelete(e, node)} title="Delete" className="p-1 hover:bg-red-500/30 rounded text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {isFolder && isExpanded && (
            <div>
              {node.children && node.children.length > 0 ? renderTree(node.children, depth + 1) : (
                <div className="py-1 text-xs text-gray-500 italic" style={{ paddingLeft: `${(depth + 1) * 12 + 32}px` }}>empty folder</div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="py-2 overflow-y-auto flex-1 custom-scrollbar">
      <div className="px-4 mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Workspace</span>
        {!readOnly && (
          <div className="flex gap-1">
            <button onClick={() => handleAddFile(null)} title="New File" className="p-1 hover:bg-[#535C91]/50 rounded text-gray-400 hover:text-white transition-colors">
              <Plus size={16} />
            </button>
            <button onClick={() => handleAddFolder(null)} title="New Folder" className="p-1 hover:bg-[#535C91]/50 rounded text-gray-400 hover:text-white transition-colors">
              <FolderPlus size={16} />
            </button>
          </div>
        )}
      </div>
      {files && files.length > 0 ? renderTree(files) : (
        <div className="px-4 py-4 text-sm text-gray-500 text-center">No files in workspace</div>
      )}
    </div>
  );
}