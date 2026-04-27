import { useState } from 'react';
import { Send, X, Trash2, MessageSquare } from 'lucide-react';

export default function CommentOverlay({ lineNumber, comments, onClose, onSubmit, onDelete, currentUser }) {
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content, lineNumber, parentCommentId: replyTo });
    setContent('');
    setReplyTo(null);
  };

  const mainComments = comments.filter(c => !c.parentCommentId);
  
  return (
    <div className="bg-[#0A0D14] border border-[#535C91]/50 rounded-lg shadow-2xl w-[90vw] sm:w-80 text-sm overflow-hidden z-50 flex flex-col pointer-events-auto">
      <div className="bg-[#1B1A55] px-3 py-2 flex justify-between items-center border-b border-[#535C91]/30">
        <span className="text-xs font-bold text-white flex items-center gap-2">
          <MessageSquare size={14} /> Line {lineNumber}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto p-2 space-y-2">
        {mainComments.map(c => (
          <div key={c.id} className="bg-[#070F2B] p-2 rounded border border-[#535C91]/20">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-xs text-blue-400">{c.username}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500">
                  {new Date(c.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                {(String(currentUser?.userId) === String(c.userId)) && (
                  <button onClick={() => onDelete(c.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-300">{c.content}</p>
            
            {/* Replies */}
            {comments.filter(reply => reply.parentCommentId === c.id).map(reply => (
               <div key={reply.id} className="mt-2 ml-4 pl-2 border-l-2 border-[#535C91]/30">
                 <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[10px] text-green-400">{reply.username}</span>
                    <button onClick={() => onDelete(reply.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                 </div>
                 <p className="text-[11px] text-gray-400">{reply.content}</p>
               </div>
            ))}
            
            <button 
              onClick={() => setReplyTo(c.id)}
              className="text-[10px] text-gray-500 hover:text-white mt-1 transition-colors"
            >
              Reply
            </button>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">No comments yet. Start a discussion!</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t border-[#535C91]/30 bg-[#070F2B]">
        {replyTo && (
          <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1 px-1">
            <span>Replying to thread...</span>
            <button type="button" onClick={() => setReplyTo(null)} className="hover:text-white transition-colors"><X size={10}/></button>
          </div>
        )}
        <div className="flex gap-2">
          <input 
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-[#1B1A55]/30 border border-[#535C91]/30 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button type="submit" disabled={!content.trim()} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-500 disabled:opacity-50 transition-colors">
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
