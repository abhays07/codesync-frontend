import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getProjectTree } from "../api/services/fileService";
import { getProjectById, requestCollaborationAccess, checkEditAccess, getProjectMembers } from "../api/services/projectService";
import { createCollabSession, joinCollabSession, getSessionParticipants } from "../api/services/collabService";
import { subscribeToSession, disconnectWebSocket } from "../api/webSocket";
import FileTree from "../components/editor/FileTree";
import CodeEditor from "../components/editor/CodeEditor";
import GlobalSearch from "../components/editor/GlobalSearch";
import { Files, Search, ArrowLeft, Users, History } from "lucide-react";
import CollabPanel from "../components/editor/CollabPanel";
import { submitJob, getJobStatus } from "../api/services/executionService";
import Terminal from "../components/editor/Terminal";
import VersionSidebar from "../components/editor/VersionSidebar";
import { DiffEditor } from '@monaco-editor/react';

const findNodeById = (nodes, targetId) => {
  if (!Array.isArray(nodes) || !targetId) return null;
  for (const node of nodes) {
    if (node?.id === targetId) return node;
    if (node?.children?.length) {
      const found = findNodeById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

const collectNumericFileIds = (nodes, into = []) => {
  if (!Array.isArray(nodes)) return into;
  for (const node of nodes) {
    if (!node) continue;
    const isFile = String(node.type || '').toUpperCase() === 'FILE' || String(node.id || '').startsWith('file-');
    if (isFile && typeof node.id === 'string') {
      const parts = node.id.split('-');
      const numeric = Number(parts[1]);
      if (Number.isFinite(numeric)) into.push(numeric);
    }
    if (node.children?.length) collectNumericFileIds(node.children, into);
  }
  return into;
};

const mergeParticipants = (a = [], b = []) => {
  const byId = new Map();
  [...a, ...b].forEach((p) => {
    const id = p?.userId ?? p?.id ?? p?.user?.userId ?? p?.user?.id;
    if (!id) return;
    byId.set(String(id), { ...p, userId: id });
  });
  return Array.from(byId.values());
};

const getUserId = (user) => user?.userId || user?.id || user?.user?.userId || user?.user?.id;
const getUserName = (user) => (
  user?.username || user?.userName || user?.name || user?.user?.username || user?.user?.name
);

export default function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');
  const [currentSession, setCurrentSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [presenceSession, setPresenceSession] = useState(null);
  const [presenceParticipants, setPresenceParticipants] = useState([]);
  const [fileParticipants, setFileParticipants] = useState([]);
  const [cursors, setCursors] = useState([]);
  const [remoteCode, setRemoteCode] = useState(null);
  const [activeTypers, setActiveTypers] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const sessionGuardRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [executionMetadata, setExecutionMetadata] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [diffMode, setDiffMode] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("user")),
    [],
  );
  
  const userId = storedUser?.userId || storedUser?.id;
  
  const currentUser = useMemo(() => ({
    userId,
    username: storedUser?.username || storedUser?.name || `User ${userId}`,
  }), [storedUser, userId]);

  const isOwner = useMemo(() => {
    if (!project || !userId) return false;
    const ownerId = project.ownerId || project.owner_id || project.owner?.id || project.owner?.userId;
    return String(ownerId) === String(userId);
  }, [project, userId]);

  const fetchTree = async () => {
    try {
      const res = await getProjectTree(projectId);
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to load file tree", err);
    }
  };

  const handleOpenFile = async (fileNode) => {
    if (!fileNode?.id) return;

    // Always pull the latest tree snapshot before opening a file so
    // remote edits are visible without a manual browser refresh.
    try {
      const res = await getProjectTree(projectId);
      const latestTree = res.data;
      setFiles(latestTree);

      const latestNode = findNodeById(latestTree, fileNode.id) || fileNode;
      setActiveFile(latestNode);
      setDiffMode(false);
    } catch (err) {
      console.error("Failed to refresh project tree", err);
      // Fallback: open whatever we have locally.
      setActiveFile(fileNode);
      setDiffMode(false);
    }
  };

  const handleVersionSelect = (ver) => {
    setSelectedVersion(ver);
    setDiffMode(true);
  };

  const handleRestore = (restoredSnapshot) => {
    setActiveFile(prev => ({ ...prev, content: restoredSnapshot.content }));
    setDiffMode(false);
    setSelectedVersion(null);
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      try {
        const [treeRes, projRes, accessRes, membersRes] = await Promise.all([
          getProjectTree(projectId),
          getProjectById(projectId),
          checkEditAccess(projectId, userId),
          getProjectMembers(projectId).catch(() => ({ data: [] }))
        ]);
        setFiles(treeRes.data);
        setProject(projRes.data);
        setProjectMembers(membersRes.data || []);
        
        // Logic: if user is NOT owner AND checkEditAccess returns false, then readOnly is true
        setIsReadOnly(!accessRes.data);
      } catch (err) {
        console.error("Failed to load environment", err);
        toast.error("Failed to load environment");
      } finally {
        setLoading(false);
      }
    };
    if (projectId && userId) {
      initPage();
    }
  }, [projectId, userId]);

  const handleRequestAccess = async () => {
    try {
      // Pass userId AND the formatted username from currentUser
      await requestCollaborationAccess(projectId, userId, currentUser.username);
      toast.success("Collaboration request sent!");
      setHasRequested(true);
    } catch (error) {
      console.error("Failed to send collaboration request", error);
      toast.error("Failed to send request. You may have already requested access.");
    }
  };

  const markTyping = (typingUserId) => {
    if (!typingUserId) return;
    setActiveTypers((prev) => ({
      ...prev,
      [typingUserId]: Date.now(),
    }));
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      setActiveTypers((prev) => {
        const next = {};
        Object.entries(prev).forEach(([typingUserId, lastSeen]) => {
          if (now - lastSeen < 2500) {
            next[typingUserId] = lastSeen;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleRunCode = async (code, language) => {
    if (!activeFile?.id || !projectId) return;
    const numericFileId = activeFile.id.split('-')[1];

    requestAnimationFrame(() => {
      setIsRunning(true);
      setShowTerminal(true);
      setTerminalOutput([{ type: 'system', text: `[Queued] Starting execution for ${activeFile.name}...` }]);
      setExecutionMetadata(null);
      setCurrentJobId(Date.now().toString());

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    });

    try {
      const res = await submitJob({
        projectId,
        fileId: numericFileId,
        language,
        sourceCode: code,
        stdin: ""
      });
      
      const jobId = res.data.jobId || res.data.id;
      setCurrentJobId(jobId);
      pollJobStatus(jobId);
    } catch (err) {
      setIsRunning(false);
      setTerminalOutput(prev => [...prev, { type: 'stderr', text: 'Error submitting job: ' + (err.response?.data?.message || err.message) }]);
    }
  };

  const pollJobStatus = async (jobId) => {
    const pollTimer = setInterval(async () => {
      try {
        const res = await getJobStatus(jobId);
        const { status, stdout, stderr, exitCode, executionTimeMs, memoryUsed } = res.data;
        
        if (status === 'RUNNING') {
          setTerminalOutput(prev => {
            if (!prev.some(msg => msg.text.includes('[Running] Executing code...'))) {
              return [...prev, { type: 'system', text: `[Running] Executing code...` }];
            }
            return prev;
          });
        }

        if (status === 'COMPLETED' || status === 'FAILED') {
          clearInterval(pollTimer);
          setIsRunning(false);
          
          const newOutput = [];
          if (stdout) newOutput.push({ type: 'stdout', text: stdout });
          if (stderr) newOutput.push({ type: 'stderr', text: stderr });
          
          if (status === 'FAILED') {
            newOutput.push({ type: 'stderr', text: `[Process exited with code ${exitCode}]` });
          } else {
            newOutput.push({ type: 'success', text: `[Finished in ${executionTimeMs}ms]` });
          }
          
          setTerminalOutput(prev => [...prev, ...newOutput]);
          setExecutionMetadata({ timeMs: executionTimeMs, memoryUsed });
        }
      } catch (err) {
        clearInterval(pollTimer);
        setIsRunning(false);
        setTerminalOutput(prev => [...prev, { type: 'stderr', text: 'Error polling status: ' + (err.message) }]);
      }
    }, 500);
  };

  useEffect(() => {
    const numericFileId = activeFile?.id?.split('-')[1];
    
    if (numericFileId && currentSession?.fileId === parseInt(numericFileId, 10)) return;

    if (numericFileId && userId && project) {
      if (sessionGuardRef.current === numericFileId) return;
      sessionGuardRef.current = numericFileId;

      const initSession = async () => {
        try {
          const sessionRes = await createCollabSession(projectId, numericFileId, userId);
          const session = sessionRes.data;
          
          setCurrentSession(session);
  
          const role = isReadOnly ? "VIEWER" : "EDITOR";
          await joinCollabSession(session.sessionId, userId, role);
          
          toast.success(`Joined as ${role}`);
        } catch (err) {
          sessionGuardRef.current = null;
          console.error("Collab session loop blocked or failed", err);
        }
      };
      initSession();
    }
  }, [activeFile?.id, userId, project?.id, projectId, isReadOnly, currentSession?.fileId]);

  // Project-wide presence session: everyone joins this immediately so all active project members
  // show up in every user's collaboration panel (even before selecting a file).
  useEffect(() => {
    if (!projectId || !userId) return;
    if (!files || files.length === 0) return;
    if (presenceSession?.sessionId) return;

    const initPresence = async () => {
      try {
        const ids = collectNumericFileIds(files);
        if (ids.length === 0) return;
        const anchorFileId = Math.min(...ids);

        const sessionRes = await createCollabSession(projectId, anchorFileId, userId);
        const session = sessionRes.data;
        setPresenceSession(session);

        const role = isReadOnly ? "VIEWER" : "EDITOR";
        await joinCollabSession(session.sessionId, userId, role);

        const res = await getSessionParticipants(session.sessionId);
        setPresenceParticipants(res.data);
      } catch (err) {
        console.error("Presence session failed to initialize", err);
      }
    };

    initPresence();
  }, [projectId, userId, files, isReadOnly, presenceSession?.sessionId]);

  useEffect(() => {
    if (currentSession) {
      let unsubscribe = () => {};

      const refreshParticipants = () => {
        getSessionParticipants(currentSession.sessionId)
          .then(res => setFileParticipants(res.data))
          .catch(err => console.warn("Failed to refresh participants", err));
      };

      subscribeToSession(currentSession.sessionId, (update) => {
        const updateType = String(update.type || update.eventType || '').toUpperCase();
        if (updateType === 'CURSOR_UPDATE') {
          setCursors(prev => {
            const existing = prev.find(c => c.userId === update.userId);
            if (existing) {
              return prev.map(c => c.userId === update.userId ? update : c);
            }
            return [...prev, update];
          });
        } else if (updateType === 'CODE_UPDATE' || updateType === 'CONTENT_UPDATE') {
          const incomingFileId = String(update.fileId || update.file?.id || '');
          const normalizedFileId = incomingFileId.startsWith('file-')
            ? incomingFileId
            : incomingFileId
              ? `file-${incomingFileId}`
              : activeFile?.id;

          markTyping(update.userId);

          if (activeFile?.id === normalizedFileId && String(update.userId) !== String(userId)) {
            const content = update.content ?? update.code ?? update.value ?? '';
            const version = update.timestamp || update.version || Date.now();

            setRemoteCode({
              fileId: normalizedFileId,
              content,
              userId: update.userId,
              version,
            });

            setActiveFile((prev) => prev?.id === normalizedFileId
              ? { ...prev, content }
              : prev
            );
          }
        } else if (updateType === 'PARTICIPANT_JOIN' || updateType === 'PARTICIPANT_LEAVE') {
          refreshParticipants();
        }
      }, 'session:file')
        .then((u) => { unsubscribe = u; })
        .catch(() => {});

      refreshParticipants();

      return () => {
        try { unsubscribe(); } catch {}
      };
    }
  }, [currentSession, activeFile?.id, userId]);

  useEffect(() => {
    if (!presenceSession?.sessionId) return;

    const refreshPresence = () => {
      getSessionParticipants(presenceSession.sessionId)
        .then(res => setPresenceParticipants(res.data))
        .catch(err => console.warn("Failed to refresh presence participants", err));
    };

    let unsubscribe = () => {};
    subscribeToSession(presenceSession.sessionId, (update) => {
      const updateType = String(update.type || update.eventType || '').toUpperCase();
      if (updateType === 'PARTICIPANT_JOIN' || updateType === 'PARTICIPANT_LEAVE') {
        refreshPresence();
      }
    }, 'session:presence')
      .then((u) => { unsubscribe = u; })
      .catch(() => {});

    refreshPresence();

    return () => {
      try { unsubscribe(); } catch {}
    };
  }, [presenceSession?.sessionId]);

  useEffect(() => {
    setParticipants(mergeParticipants(presenceParticipants, fileParticipants));
  }, [presenceParticipants, fileParticipants]);

  useEffect(() => () => {
    disconnectWebSocket();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070F2B] text-sm text-[#9290C3]">
        <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#9290C3] border-t-transparent rounded-full animate-spin"></div>
            <span>Syncing Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#070F2B] overflow-hidden">
      {/* LEFT: Activity Bar */}
      <div className="w-12 border-r border-[#535C91]/30 bg-[#1B1A55]/40 flex flex-col items-center justify-between py-4 gap-4 z-10 shrink-0">
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
          <button 
            onClick={() => setActiveTab('collab')}
            className={`p-2 rounded-xl transition-all ${activeTab === 'collab' ? 'bg-[#535C91]/50 text-white' : 'text-gray-400 hover:text-white hover:bg-[#535C91]/30'}`}
            title="Collaboration"
          >
            <Users size={20} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setActiveTab('version')}
            className={`p-2 rounded-xl transition-all ${activeTab === 'version' ? 'bg-[#535C91]/50 text-white' : 'text-gray-400 hover:text-white hover:bg-[#535C91]/30'}`}
            title="Version Control"
          >
            <History size={20} strokeWidth={1.5} />
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
      <aside className="w-64 border-r border-[#535C91]/30 bg-[#1B1A55]/20 backdrop-blur-xl flex flex-col shrink-0">
        {activeTab === 'explore' ? (
          <>
            <div className="p-4 border-b border-[#535C91]/30 flex-shrink-0">
              <h2 className="text-sm font-bold text-[#9290C3] uppercase tracking-widest">Explorer</h2>
            </div>
            
            {/* COLLABORATION REQUEST SECTION */}
            {isReadOnly && !isOwner && (
              <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20">
                <p className="text-[11px] text-yellow-400/80 mb-2 text-center font-medium">VIEW-ONLY MODE</p>
                <button 
                  onClick={handleRequestAccess}
                  disabled={hasRequested}
                  className="w-full py-2 bg-yellow-500 text-[#070F2B] text-xs font-bold rounded-lg hover:bg-yellow-400 transition-all disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed shadow-lg"
                >
                  {hasRequested ? 'Request Sent' : 'Request Edit Access'}
                </button>
              </div>
            )}

            <FileTree
              files={files}
              activeFile={activeFile}
              onFileClick={handleOpenFile}
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
        ) : activeTab === 'search' ? (
          <>
            <div className="p-4 border-b border-[#535C91]/30 flex-shrink-0">
              <h2 className="text-sm font-bold text-[#9290C3] uppercase tracking-widest">Search</h2>
            </div>
            <GlobalSearch
              projectId={projectId}
              onFileSelect={(file) => setActiveFile(file)}
            />
          </>
        ) : activeTab === 'version' ? (
          <VersionSidebar 
             activeFile={activeFile}
             userId={userId}
             username={currentUser.username}
             onVersionSelect={handleVersionSelect}
             onRestore={handleRestore}
          />
        ) : (
          <CollabPanel
            participants={participants}
            projectId={projectId}
            isOwner={isOwner}
            currentUser={currentUser}
            activeTypers={activeTypers}
            sessionId={currentSession?.sessionId}
          />
        )}
      </aside>

      {/* RIGHT: Monaco Editor */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeFile ? (
          <div className="flex-1 flex flex-col min-h-0">
            {diffMode ? (
              <div className="flex-1 flex flex-col">
                <div className="h-10 bg-[#1B1A55]/40 border-b border-[#535C91]/30 flex items-center justify-between px-4">
                  <span className="text-xs font-mono text-[#9290C3] tracking-wide">
                    Comparing: Local Changes vs {selectedVersion?.commitMessage || "Previous Version"}
                  </span>
                  <button 
                    onClick={() => setDiffMode(false)} 
                    className="text-xs bg-[#535C91]/50 px-3 py-1 text-white rounded hover:bg-[#535C91] transition-colors font-bold"
                  >
                    Back to Editor
                  </button>
                </div>
                <DiffEditor
                  height="100%"
                  theme="vs-dark"
                  original={selectedVersion?.content || ''}
                  modified={activeFile.content || ''}
                  language={activeFile.name.split('.').pop() === 'py' ? 'python' : activeFile.name.split('.').pop() === 'js' ? 'javascript' : activeFile.name.split('.').pop() === 'java' ? 'java' : 'plaintext'}
                  options={{ 
                    readOnly: true,
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                    minimap: { enabled: true },
                    padding: { top: 20 },
                    automaticLayout: true
                  }}
                />
              </div>
            ) : (
              <CodeEditor
                key={activeFile.id}
                file={activeFile}
                readOnly={isReadOnly}
                userId={userId}
                sessionId={currentSession?.sessionId}
                cursors={cursors.filter(c => c.userId !== userId).map(c => {
                   const p = participants.find(part => String(getUserId(part)) === String(c.userId));
                   const pm = projectMembers.find(m => String(getUserId(m)) === String(c.userId));
                   return {
                     ...c,
                     color: c.color || p?.color || '#06B6D4',
                     username: pm?.username || getUserName(pm) || p?.username || c.username || `User ${c.userId}`
                   };
                })}
                remoteCode={remoteCode}
                onLocalActivity={() => markTyping(userId)}
                onRunCode={handleRunCode}
                isRunning={isRunning}
              />
            )}
            <Terminal
              key={currentJobId || "terminal"}
              isOpen={showTerminal}
              output={terminalOutput}
              isRunning={isRunning}
              onClose={() => setShowTerminal(false)}
              onClear={() => setTerminalOutput([])}
              metadata={executionMetadata}
              language={activeFile.name.split('.').pop()}
              filename={activeFile.name}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1B1A55]/30 flex items-center justify-center border border-[#535C91]/20">
                <Files size={32} className="opacity-20" />
            </div>
            <p className="text-sm font-medium">Select a file to start coding</p>
          </div>
        )}
      </main>
    </div>
  );
}
