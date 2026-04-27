import { useState, useEffect } from 'react';
import { History, Save, RotateCcw, Loader2 } from 'lucide-react';
import { createSnapshot, getFileHistory, restoreSnapshot } from '../../api/services/versionService';
import toast from 'react-hot-toast';

export default function VersionSidebar({ activeFile, userId, username, onVersionSelect, onRestore, onNotifyCommit }) {
  const [history, setHistory] = useState([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const fetchHistory = async () => {
    if (!activeFile?.id) return;
    const numericFileId = activeFile.id.split('-')[1];
    if (!numericFileId) return;
    setFetchingHistory(true);
    try {
      const res = await getFileHistory(numericFileId);
      setHistory(res.data || []);
    } catch (err) {
      // Intentionally suppressing console.error for production readiness.
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile?.id]);

  const handleCommit = async () => {
    if (!commitMessage.trim()) return toast.error("Commit message required");
    setLoading(true);
    try {
      const numericFileId = activeFile.id.split('-')[1];
      await createSnapshot({
        fileId: numericFileId,
        userId,
        username,
        content: activeFile.content || '',
        commitMessage
      });
      setCommitMessage('');
      fetchHistory();
      toast.success("Snapshot saved!");
      
      // Notify project members + owner about the new version
      if (typeof onNotifyCommit === 'function') {
        onNotifyCommit(commitMessage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to save snapshot");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (snapshotId) => {
    try {
      const res = await restoreSnapshot(snapshotId, userId);
      onRestore(res.data);
      toast.success("Version restored!");
      fetchHistory();
    } catch (err) {
      toast.error(err.message || "Failed to restore version");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!activeFile) {
    return <div className="p-4 text-gray-500 text-sm">Select a file to view history.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#535C91]/30 flex-shrink-0">
        <h2 className="text-sm font-bold text-[#9290C3] uppercase tracking-widest mb-4 flex items-center gap-2">
          <History size={16} /> Version Control
        </h2>
        <div className="space-y-2">
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message..."
            className="w-full bg-[#070F2B] text-sm text-white border border-[#535C91]/50 rounded p-2 h-20 resize-none focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCommit}
            disabled={loading || !commitMessage.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Save size={14} /> Commit Changes
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {fetchingHistory ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-xs">Loading history...</span>
          </div>
        ) : (
          <>
            {history.map((ver) => (
              <div 
                key={ver.snapshotId || ver.id} 
                className="bg-[#070F2B] border border-[#535C91]/30 p-3 rounded hover:border-[#535C91] transition-colors cursor-pointer group" 
                onClick={() => onVersionSelect(ver)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-white truncate pr-2">{ver.username}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRestore(ver.snapshotId || ver.id); }}
                    className="text-gray-500 hover:text-green-400 transition-colors"
                    title="Restore this version"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-300 mb-2 line-clamp-2">{ver.commitMessage}</p>
                <div className="text-[10px] text-gray-500 text-right">
                  {formatTime(ver.createdAt)}
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-gray-400 mb-2">No versions saved yet.</p>
                <p className="text-[10px] text-gray-500">Make your first commit!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
