import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  approveCollaborator,
  getPendingRequests,
  getProjectMembers,
  removeProjectMember,
} from '../../api/services/projectService';
import { UserMinus } from 'lucide-react';

const getUserId = (user) => user?.userId || user?.id || user?.user?.userId || user?.user?.id;

const getUserName = (user) => (
  user?.username ||
  user?.userName ||
  user?.requesterUsername ||
  user?.requestedByUsername ||
  user?.fullName ||
  user?.name ||
  user?.user?.username ||
  user?.user?.name ||
  `User ${getUserId(user)}`
);

const normalizeAccessUser = (user) => ({
  userId: getUserId(user),
  username: getUserName(user),
  role: user?.role || user?.accessRole || user?.memberRole || 'EDITOR',
  color: user?.color,
});

const mergeUsers = (accessUsers, participants, currentUser) => {
  const byId = new Map();

  accessUsers.forEach((user) => {
    if (!user.userId) return;
    byId.set(String(user.userId), user);
  });

  participants.forEach((participant) => {
    const userId = getUserId(participant);
    if (!userId) return;
    const key = String(userId);
    const existing = byId.get(key) || {};

    let resolvedUsername = getUserName(participant);
    if (existing.username && !existing.username.startsWith('User ')) {
      resolvedUsername = existing.username;
    }

    byId.set(key, {
      ...existing,
      userId,
      username: resolvedUsername,
      role: participant.role || existing.role || 'EDITOR',
      color: participant.color || existing.color,
    });
  });

  if (currentUser?.userId) {
    const key = String(currentUser.userId);
    const existing = byId.get(key) || {};
    byId.set(key, {
      ...existing,
      userId: currentUser.userId,
      username: currentUser.username || existing.username || `User ${currentUser.userId}`,
      role: existing.role || 'YOU',
    });
  }

  return Array.from(byId.values());
};

export default function CollabPanel({
  participants = [],
  projectId,
  isOwner,
  currentUser,
  activeTypers = {},
}) {
  const [requests, setRequests] = useState([]);
  const [accessUsers, setAccessUsers] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingAccessUsers, setLoadingAccessUsers] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState(null);

  const onlineIds = useMemo(() => {
    const ids = new Set(participants.map((p) => String(getUserId(p))));
    return ids;
  }, [participants]);

  const liveParticipantIds = useMemo(() => {
    return new Set(Object.keys(activeTypers));
  }, [activeTypers]);

  const { liveParticipants, accessList } = useMemo(() => {
    const users = mergeUsers(accessUsers, participants, currentUser);
    const knownIds = new Set(users.map((user) => String(user.userId)));

    Object.keys(activeTypers).forEach((userId) => {
      if (!knownIds.has(String(userId))) {
        const participant = participants.find(p => String(getUserId(p)) === userId);
        users.push({
          userId,
          username: participant ? getUserName(participant) : `User ${userId}`,
          role: 'EDITOR',
        });
      }
    });

    const live = users.filter(u => onlineIds.has(String(u.userId)));
    const access = users; // Show all users in access list

    return { liveParticipants: live, accessList: access };
  }, [accessUsers, participants, currentUser, activeTypers, onlineIds]);

  const liveUsers = liveParticipants.filter((user) => onlineIds.has(String(user.userId)));
  const offlineUsers = accessList.filter((user) => !onlineIds.has(String(user.userId)));

  const fetchRequests = useCallback(async () => {
    if (!isOwner || !projectId) {
      setRequests([]);
      return;
    }

    try {
      setLoadingRequests(true);
      const res = await getPendingRequests(projectId);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch pending requests', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [isOwner, projectId]);

  const fetchAccessUsers = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoadingAccessUsers(true);
      const res = await getProjectMembers(projectId);
      const users = Array.isArray(res.data) ? res.data : [];
      setAccessUsers(users.map(normalizeAccessUser));
    } catch (err) {
      console.warn('Project members endpoint unavailable, using live participants as fallback', err);
      setAccessUsers(mergeUsers([], participants, currentUser));
    } finally {
      setLoadingAccessUsers(false);
    }
  }, [currentUser, participants, projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchRequests, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchRequests]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchAccessUsers, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchAccessUsers]);

  const handleApprove = async (requestedUserId) => {
    try {
      setApprovingUserId(requestedUserId);
      await approveCollaborator(projectId, requestedUserId);
      toast.success(`Approved user ${requestedUserId}`);
      await fetchRequests();
      await fetchAccessUsers();
    } catch (err) {
      console.error('Failed to approve collaborator', err);
      toast.error(err.message || 'Approval failed');
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleRemoveMember = async (removeUserId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeProjectMember(projectId, removeUserId);
      toast.success('Member removed');
      await fetchAccessUsers();
    } catch (err) {
      console.error('Failed to remove member', err);
      toast.error(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto">
      {isOwner && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Pending Requests</h3>

          {loadingRequests ? (
            <p className="text-xs text-gray-400">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-xs text-gray-500">No pending requests</p>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <div
                  key={`${req.projectId}-${req.userId}`}
                  className="flex items-center justify-between gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-gray-100 truncate">{getUserName(req)}</span>
                    <span className="text-[10px] text-gray-500">ID: {req.userId}</span>
                  </div>
                  <button
                    onClick={() => handleApprove(req.userId)}
                    disabled={approvingUserId === req.userId}
                    className="bg-yellow-500 text-[#070F2B] px-2 py-1 text-[10px] font-bold rounded hover:bg-yellow-400 disabled:bg-gray-500 disabled:cursor-not-allowed shrink-0"
                  >
                    {approvingUserId === req.userId ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Participants</h3>
          <span className="text-[10px] text-green-400 font-bold">{liveUsers.length} online</span>
        </div>

        {liveUsers.length === 0 ? (
          <p className="text-xs text-gray-500">No active participants yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {liveUsers.map((user) => {
              const isTyping = Boolean(activeTypers[user.userId]);

              return (
                <div key={`live-${user.userId}`} className="flex items-center gap-3 group">
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: user.color || '#9290C3', color: '#070F2B' }}
                    >
                      {String(user.username || user.userId).slice(0, 1).toUpperCase()}
                    </div>
                    <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-[#070F2B]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-gray-200 truncate">{user.username}</span>
                    <span className={`text-[10px] uppercase font-bold ${isTyping ? 'text-green-400' : 'text-gray-500'}`}>
                      {isTyping ? 'Typing now' : user.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-[#535C91]/30 pt-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Access List</h3>

        {loadingAccessUsers ? (
          <p className="text-xs text-gray-400">Loading users...</p>
        ) : accessList.length === 0 ? (
          <p className="text-xs text-gray-500">No approved users found</p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...liveUsers, ...offlineUsers].map((user) => {
              const isOnline = onlineIds.has(String(user.userId));
              const isCurrentUser = String(user.userId) === String(currentUser?.userId);

              return (
                <div
                  key={`access-${user.userId}`}
                  className="flex items-center justify-between rounded-lg border border-[#535C91]/20 bg-[#070F2B]/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${isOnline ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-xs text-gray-200 truncate">{user.username}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-gray-500 uppercase">{user.role}</span>
                    {isOwner && !isCurrentUser && (
                      <button
                        onClick={() => handleRemoveMember(user.userId)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="Remove Member"
                      >
                        <UserMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
