import Editor from '@monaco-editor/react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { updateFileContent } from '../../api/services/fileService';
import { updateCursorPosition } from '../../api/services/collabService';
import { sendCodeChange } from '../../api/webSocket';
import { CloudCheck, Loader2, Play } from 'lucide-react';
import CommentOverlay from './CommentOverlay';

// No external cursor wrapper, using CSS after pseudo-element with monaco widget

export default function CodeEditor({
  file,
  readOnly,
  userId,
  sessionId,
  cursors,
  remoteCode,
  onLocalActivity,
  onRunCode,
  isRunning,
  comments = [],
  onCommentSubmit,
  onCommentDelete,
  currentUser,
  scrollToLine
}) {
  const [code, setCode] = useState(file.content || '');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);
  const cursorTimerRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const lastRemoteKeyRef = useRef(null);
  const decorationsRef = useRef([]);
  const isRemoteUpdateRef = useRef(false);
  
  const [widgetLine, setWidgetLine] = useState(null);
  const [commentWidgetNode, setCommentWidgetNode] = useState(null);
  const commentDecorationsRef = useRef([]);

  useEffect(() => {
    const node = document.createElement('div');
    node.className = "monaco-custom-content-widget";
    // Important: block editor from stealing focus from the widget inputs
    node.addEventListener('mousedown', (e) => e.stopPropagation());
    setCommentWidgetNode(node);
    return () => {
      node.remove();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && commentWidgetNode && widgetLine) {
      const widget = {
        getId: () => 'comment.widget',
        getDomNode: () => commentWidgetNode,
        getPosition: () => ({
          position: { lineNumber: widgetLine, column: 1 },
          preference: [2] // BELOW
        })
      };
      editorRef.current.addContentWidget(widget);
      return () => editorRef.current.removeContentWidget(widget);
    }
  }, [widgetLine, commentWidgetNode]);

  useEffect(() => {
    if (scrollToLine && editorRef.current) {
      editorRef.current.revealLineInCenter(scrollToLine);
      setWidgetLine(scrollToLine);
    }
  }, [scrollToLine]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const linesWithComments = [...new Set(comments.map(c => c.lineNumber))];
      const newDecorations = linesWithComments.map(line => ({
        range: new monacoRef.current.Range(line, 1, line, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: 'comment-glyph-icon',
          glyphMarginHoverMessage: { value: 'View Comments' }
        }
      }));

      commentDecorationsRef.current = editorRef.current.deltaDecorations(
        commentDecorationsRef.current,
        newDecorations
      );
    }
  }, [comments]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Listen for Gutter clicks to open comment widget
    editor.onMouseDown((e) => {
      if (
        e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
      ) {
        const lineNumber = e.target.position.lineNumber;
        setWidgetLine(lineNumber);
      }
    });

    // Listen for Cursor Position Changes
    editor.onDidChangeCursorPosition((e) => {
      if (sessionId) {
        if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
        cursorTimerRef.current = setTimeout(() => {
          updateCursorPosition(sessionId, userId, e.position.lineNumber, e.position.column);
        }, 50);
      }
    });
  };

  useEffect(() => {
    if (editorRef.current && monacoRef.current && cursors) {
      const newDecorations = cursors.map(cursor => {
        const { line, col, userId, username, color } = cursor;
        return {
          range: new monacoRef.current.Range(line, col, line, col),
          options: {
            className: `remote-cursor-${userId}`,
            hoverMessage: {
              value: username || `User ${userId}`
            }
          }
        };
      });

      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        newDecorations
      );
    }
  }, [cursors, editorRef.current]);

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

  useEffect(() => {
    if (!remoteCode || remoteCode.fileId !== file.id) return;
    if (remoteCode.userId && String(remoteCode.userId) === String(userId)) return;
    const remoteKey = `${remoteCode.userId}-${remoteCode.version}`;
    if (lastRemoteKeyRef.current === remoteKey) return;

    lastRemoteKeyRef.current = remoteKey;

    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model && model.getValue() !== remoteCode.content) {
        isRemoteUpdateRef.current = true;
        model.applyEdits([{
          range: model.getFullModelRange(),
          text: remoteCode.content || ''
        }]);
        isRemoteUpdateRef.current = false;
      }
    }
  }, [file.id, remoteCode, userId]);

  const handleRun = () => {
    if (!onRunCode) return;
    if (editorRef.current) {
      const currentCode = editorRef.current.getValue();
      onRunCode(currentCode, getLanguage(file.name));
    } else {
      onRunCode(code, getLanguage(file.name));
    }
  };

  const handleEditorChange = (value) => {
    if (readOnly) return;
    if (isRemoteUpdateRef.current) return;
    setCode(value);
    onLocalActivity?.('typing');

    if (sessionId) {
      sendCodeChange(sessionId, {
        userId,
        fileId: file.id,
        content: value || '',
        timestamp: Date.now(),
      });
    }
    
    // DEBOUNCED AUTO-SAVE
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setSaving(true);
    timerRef.current = setTimeout(async () => {
      try {
        const fileId = file.id.split('-')[1];
        await updateFileContent(fileId, value, userId);
        setSaving(false);
      } catch (err) {
        console.error("Auto-save failed", err);
        setSaving(false);
      }
    }, 2000);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#070F2B] relative">
      <style>{`
        ${cursors.map(c => `
          .remote-cursor-${c.userId} {
            border-left: 2px solid ${c.color} !important;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
          }
          .remote-cursor-${c.userId}::after {
            content: '${c.username?.replace(/'/g, "\\'") || `User ${c.userId}`}';
            position: absolute;
            top: -16px;
            left: 0;
            background-color: ${c.color};
            color: #fff;
            font-size: 10px;
            padding: 0 4px;
            border-radius: 2px 2px 2px 0;
            white-space: nowrap;
            pointer-events: none;
          }
        `).join('\n')}
        
        .comment-glyph-icon::after {
          content: '💬';
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          cursor: pointer;
          opacity: 0.8;
        }
        .comment-glyph-icon:hover::after {
          opacity: 1;
        }
      `}</style>
      
      {commentWidgetNode && widgetLine && createPortal(
        <CommentOverlay 
          lineNumber={widgetLine} 
          comments={comments.filter(c => c.lineNumber === widgetLine)} 
          onClose={() => setWidgetLine(null)}
          onSubmit={onCommentSubmit}
          onDelete={onCommentDelete}
          currentUser={currentUser}
        />, 
        commentWidgetNode
      )}

      {/* Editor Tab Header */}
      <div className="h-10 bg-[#1B1A55]/40 border-b border-[#535C91]/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#9290C3] tracking-wide">
            {file.name}
          </span>
          <div className="h-4 w-px bg-[#535C91]/40 mx-2" />
          <span className="text-[10px] text-gray-500 uppercase font-bold">
            {getLanguage(file.name)}
          </span>
          <div className="h-4 w-px bg-[#535C91]/40 mx-2" />
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-green-600/20 text-green-400 px-3 py-1 rounded text-xs font-bold hover:bg-green-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            <span>RUN</span>
          </button>
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
      <div className="flex-1 border-t border-[#535C91]/10 relative">
        <Editor
          height="100%"
          theme="vs-dark"
          path={file.name}
          language={getLanguage(file.name)}
          defaultValue={file.content || ''}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly: readOnly,
            fontSize: 14,
            minimap: { enabled: true },
            padding: { top: 20 },
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            glyphMargin: true,
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
            },
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
