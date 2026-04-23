import Editor from '@monaco-editor/react';
import { useState, useEffect, useRef } from 'react';
import { updateFileContent } from '../../api/services/fileService';
import { CloudCheck, Loader2 } from 'lucide-react';

export default function CodeEditor({ file, readOnly, userId }) {
  const [code, setCode] = useState(file.content || '');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);

  // Helper: Detect language based on extension
  const getLanguage = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const map = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'java': 'java',
      'py': 'python',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql'
    };
    return map[ext] || 'plaintext';
  };

  // Sync editor when switching files
  useEffect(() => {
    setCode(file.content || '');
  }, [file.id, file.content]);

  const handleEditorChange = (value) => {
    if (readOnly) return;
    setCode(value);
    
    // DEBOUNCED AUTO-SAVE
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setSaving(true);
    timerRef.current = setTimeout(async () => {
      try {
        const fileId = file.id.split('-')[1];
        await updateFileContent(fileId, value, userId);
        setSaving(false);
      } catch (err) {
        console.error("Auto-save failed");
        setSaving(false);
      }
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070F2B]">
      {/* Editor Tab Header */}
      <div className="h-10 bg-[#1B1A55]/40 border-b border-[#535C91]/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#9290C3] tracking-wide">
            {file.name}
          </span>
          <div className="h-4 w-[1px] bg-[#535C91]/40 mx-2" />
          <span className="text-[10px] text-gray-500 uppercase font-bold">
            {getLanguage(file.name)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {saving ? (
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="text-[10px] font-bold">SAVING</span>
              <Loader2 size={12} className="animate-spin" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-green-500/70">
              <span className="text-[10px] font-bold">SYNCED</span>
              <CloudCheck size={14} />
            </div>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 border-t border-[#535C91]/10">
        <Editor
          height="100%"
          theme="vs-dark"
          path={file.name}
          language={getLanguage(file.name)}
          value={code}
          onChange={handleEditorChange}
          options={{
            readOnly: readOnly,
            fontSize: 14,
            minimap: { enabled: true },
            padding: { top: 20 },
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
            },
            lineNumbers: 'on',
            renderLineHighlight: 'all',
          }}
        />
      </div>
    </div>
  );
}