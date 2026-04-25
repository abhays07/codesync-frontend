import { X, Trash2 } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function Terminal({
  isOpen,
  output,
  isRunning,
  onClose,
  onClear,
  metadata,
  language,
  filename
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, isOpen]);

  return (
    <div className={`bg-[#0A0D14] border-t flex flex-col font-mono text-sm relative z-20 shrink-0 transition-all duration-300 overflow-hidden ${isOpen ? 'h-64 border-[#535C91]/30' : 'h-0 border-transparent opacity-0'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1B1A55]/40 border-b border-[#535C91]/20">
        <div className="flex items-center gap-2 text-[#9290C3] text-xs">
          <span className="font-bold uppercase tracking-wider">Terminal</span>
          <span className="text-gray-500">|</span>
          <span className="truncate max-w-md">
             [Running] {language} "{filename}"
          </span>
          {isRunning && (
            <span className="flex items-center gap-1 ml-2 text-yellow-500">
              <span className="animate-pulse">●</span> Running
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-gray-400">
          <button 
            onClick={onClear} 
            className="hover:text-white transition-colors"
            title="Clear Terminal"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={onClose} 
            className="hover:text-white transition-colors"
            title="Close Panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1" ref={scrollRef}>
        {output.map((line, idx) => {
          let colorClass = "text-white";
          if (line.type === "stderr") colorClass = "text-red-400";
          else if (line.type === "system") colorClass = "text-blue-400";
          else if (line.type === "success") colorClass = "text-green-400";

          return (
            <div key={idx} className={`${colorClass} break-all whitespace-pre-wrap`}>
              {line.text}
            </div>
          );
        })}
        {output.length === 0 && !isRunning && (
          <div className="text-gray-500 italic">No output. Press Run to execute.</div>
        )}
      </div>

      {/* Footer / Metadata */}
      {metadata && !isRunning && (
        <div className="px-4 py-1.5 bg-[#070F2B]/50 border-t border-[#535C91]/20 text-[10px] text-gray-500 flex justify-end gap-4">
          <span>Execution Time: {metadata.timeMs}ms</span>
          {metadata.memoryUsed && <span>Memory: {metadata.memoryUsed}MB</span>}
        </div>
      )}
    </div>
  );
}
