import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Users, MessageSquare, AlertCircle, CheckCircle, XCircle, RefreshCw, CheckCheck, Trash2, Trash, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { approveCollaborator } from '../../api/services/projectService';
import { sendNotification } from '../../api/services/notificationService';
import toast from 'react-hot-toast';

export default function NotificationCenter({ placement = "bottom-end" }) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    handleMarkAsRead, 
    handleRefresh, 
    handleMarkAllAsRead, 
    handleDeleteNotification, 
    handleClearAll 
  } = useNotifications();
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user?.userId || user?.id;
  const currentUsername = user?.username || user?.name || `User ${currentUserId}`;
  const currentUserEmail = user?.email;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'COLLAB_REQUEST': 
      case 'COLLABORATION_REQUEST': return <Users size={16} className="text-blue-400" />;
      case 'COLLAB_RESPONSE':
      case 'COLLABORATION_ACCEPTED': return <CheckCircle size={16} className="text-green-400" />;
      case 'COLLABORATION_REJECTED': return <XCircle size={16} className="text-red-400" />;
      case 'COMMENT': return <MessageSquare size={16} className="text-green-400" />;
      default: return <AlertCircle size={16} className="text-yellow-400" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  const handleApprove = async (n, e) => {
    e.stopPropagation();
    
    console.log("APPROVE CLICKED. NOTIFICATION OBJECT:", n);

    // Fallback logic for project ID if backend uses a different case or it's missing
    const projectId = n.relatedId || n.related_id || n.referenceId || n.reference_id || n.projectId || n.project_id || n.targetId || n.target_id;
    if (!projectId) {
      return toast.error("Missing Project ID");
    }

    try {
      await approveCollaborator(projectId, n.senderId);
      toast.success("Request approved!");
      
      const projectNameStr = n.message || '';
      let projectName = projectNameStr.split('project: ')[1] || projectNameStr.split(' requested access to ')[1] || 'the project';
      if (projectName.endsWith('.')) {
        projectName = projectName.slice(0, -1);
      }

      handleMarkAsRead(n.id, 'COLLAB_RESPONSE', `You approved ${n.senderName}'s request to join ${projectName}.`);

      // Notify requester
      await sendNotification({
        recipientId: n.senderId,
        senderId: currentUserId,
        senderName: currentUsername,
        type: 'COLLAB_RESPONSE',
        message: `Hey ${n.senderName}, your request to join ${projectName} has been Approved.`,
        relatedId: projectId,
        senderEmail: currentUserEmail
      }, n.senderEmail ? [n.senderEmail] : []);

      // Notify manager
      if (n.senderEmail) {
        await sendNotification({
          recipientId: currentUserId,
          senderId: currentUserId,
          senderName: 'System',
          type: 'SYSTEM',
          message: `Confirmation mail sent to ${n.senderName} in email ${n.senderEmail}.`,
          relatedId: projectId
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to approve request or send email", err);
      toast.error("Operation failed. Ensure email service is running.");
    }
  };

  const handleIgnore = async (n, e) => {
    e.stopPropagation();

    const projectId = n.relatedId || n.related_id || n.referenceId || n.reference_id || n.projectId || n.project_id || n.targetId || n.target_id;
    if (!projectId) return;

    const projectNameStr = n.message || '';
    let projectName = projectNameStr.split('project: ')[1] || projectNameStr.split(' requested access to ')[1] || 'the project';
    if (projectName.endsWith('.')) {
      projectName = projectName.slice(0, -1);
    }

    handleMarkAsRead(n.id, 'COLLABORATION_REJECTED', `You ignored ${n.senderName}'s request to join ${projectName}.`); // Using local rejected type so UI shows Red X
    toast('Request ignored', { icon: '🚫' });

    try {
      await sendNotification({
        recipientId: n.senderId,
        senderId: currentUserId,
        senderName: currentUsername,
        type: 'COLLABORATION_REJECTED',
        message: `Hey ${n.senderName}, your request to join ${projectName} has been Ignored.`,
        relatedId: projectId,
        senderEmail: currentUserEmail
      }, n.senderEmail ? [n.senderEmail] : []);
    } catch (err) {
      console.error("Failed to notify rejection", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-[#535C91]/30"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute w-80 max-h-[28rem] overflow-hidden rounded-lg border border-[#535C91]/50 bg-[#070F2B] shadow-2xl flex flex-col z-50 ${
          placement === 'right-end' ? 'bottom-0 left-full ml-4' : 'right-0 mt-2'
        }`}>
          <div className="p-3 border-b border-[#535C91]/30 bg-[#1B1A55] flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-[#535C91] text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </h3>
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); handleRefresh(); }} title="Refresh" className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-[#535C91]/30 rounded transition-colors">
                <RefreshCw size={14} />
              </button>
              {unreadCount > 0 && (
                <button onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead(); }} title="Mark all as read" className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-[#535C91]/30 rounded transition-colors">
                  <CheckCheck size={14} />
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={(e) => { e.stopPropagation(); handleClearAll(); }} title="Clear all" className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#535C91]/30 rounded transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-[#535C91]/20">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => {
                      if (!n.read && !n.isRead && n.type !== 'COLLABORATION_REQUEST' && n.type !== 'COLLAB_REQUEST') {
                        handleMarkAsRead(n.id);
                      }
                    }}
                    className={`p-3 transition-colors ${
                      !n.read && !n.isRead 
                        ? 'bg-[#535C91]/10' 
                        : 'hover:bg-[#1B1A55]/30'
                    } ${(!n.read && !n.isRead && n.type !== 'COLLABORATION_REQUEST' && n.type !== 'COLLAB_REQUEST') ? 'cursor-pointer hover:bg-[#535C91]/30' : ''}`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 flex-shrink-0">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-gray-200 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{formatTimeAgo(n.createdAt)}</p>
                        
                        { (n.type === 'COLLABORATION_REQUEST' || n.type === 'COLLAB_REQUEST') && !n.read && !n.isRead && (
                          <div className="mt-2 flex gap-2">
                            <button 
                              onClick={(e) => handleApprove(n, e)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={(e) => handleIgnore(n, e)}
                              className="px-3 py-1 bg-[#535C91]/30 hover:bg-[#535C91]/50 text-gray-300 text-[10px] font-bold rounded transition-colors"
                            >
                              Ignore
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {n.type !== 'COLLABORATION_REQUEST' && n.type !== 'COLLAB_REQUEST' && !n.read && !n.isRead && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                            className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n.id); }}
                          className="text-gray-500 hover:text-red-400 flex-shrink-0"
                          title="Delete notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
