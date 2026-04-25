import { MessageSquare, MessageCircle } from 'lucide-react';

export default function DiscussionSidebar({ comments, onCommentClick }) {
  if (!comments) return null;

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#1B1A55]/20">
      <div className="p-4 border-b border-[#535C91]/30 flex-shrink-0">
        <h2 className="text-sm font-bold text-[#9290C3] uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={16} /> Discussions
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.filter(c => !c.parentCommentId).map(c => {
          const replies = comments.filter(r => r.parentCommentId === c.id);
          return (
            <div 
              key={c.id} 
              className="bg-[#070F2B] border border-[#535C91]/30 p-3 rounded hover:border-[#535C91] transition-colors cursor-pointer group"
              onClick={() => onCommentClick(c.lineNumber)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-blue-400">{c.username}</span>
                <span className="text-[10px] text-gray-500 group-hover:text-blue-400 transition-colors">Line {c.lineNumber}</span>
              </div>
              <p className="text-xs text-gray-300 line-clamp-3 mb-1">{c.content}</p>
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>{formatTime(c.createdAt)}</span>
                {replies.length > 0 && (
                  <span className="flex items-center gap-1 text-green-400/80">
                    <MessageCircle size={10} /> {replies.length} replies
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400 mb-2">No active discussions.</p>
            <p className="text-[10px] text-gray-500">Click a line number in the editor to add a comment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
