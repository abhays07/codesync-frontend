import { Search, FileText } from 'lucide-react';
import { useState } from 'react';
import { searchInProject } from '../../api/services/fileService';

const getSnippets = (content, term) => {
    if (!content || !term) return [];
    const lines = content.split('\n');
    const snippets = [];
    const lowerTerm = term.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lowerTerm)) {
            let text = lines[i].trim();
            // Truncate extremely long lines (like minified files)
            if (text.length > 100) {
                const termIdx = text.toLowerCase().indexOf(lowerTerm);
                const start = Math.max(0, termIdx - 40);
                const end = Math.min(text.length, termIdx + term.length + 40);
                text = (start > 0 ? "..." : "") + text.substring(start, end) + (end < text.length ? "..." : "");
            }
            snippets.push({ lineNum: i + 1, text });
            if (snippets.length >= 5) break; // Display max 5 snippets per file
        }
    }
    return snippets;
};

const renderTextWithHighlight = (text, term) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) => 
        part.toLowerCase() === term.toLowerCase() ? 
            <span key={i} className="bg-[#5c3e1e] text-[#f2cc96] px-[2px] rounded-[2px] font-bold">{part}</span> : 
            <span key={i}>{part}</span>
    );
};

export default function GlobalSearch({ projectId, onFileSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e) => {
        if (e.key === 'Enter' && query.length > 2) {
            setSearching(true);
            try {
                const res = await searchInProject(projectId, query);
                setResults(res.data);
            } finally {
                setSearching(false);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col p-4 bg-[#070F2B]/50 overflow-hidden">
            <div className="relative group flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#9290C3]" size={14} />
                <input 
                    className="w-full bg-[#070F2B] border border-[#535C91]/50 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-[#9290C3] transition-all"
                    placeholder="Search in project..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                />
            </div>

            {searching ? (
                <div className="mt-8 flex justify-center">
                    <p className="text-xs text-blue-400 animate-pulse">Searching...</p>
                </div>
            ) : results.length > 0 ? (
                <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-2">
                        {results.length} result{results.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-4">
                        {results.map(file => {
                            const snippets = getSnippets(file.content, query);
                            return (
                                <div key={file.fileId} className="flex flex-col">
                                    <button 
                                        onClick={() => onFileSelect({ id: `file-${file.fileId}`, ...file })}
                                        className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-[#535C91]/20 text-left transition-colors"
                                    >
                                        <FileText size={14} className="text-[#9290C3] flex-shrink-0" />
                                        <div className="min-w-0 flex-1 flex items-baseline gap-2 overflow-hidden">
                                            <p className="text-xs text-white truncate font-medium">{file.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate flex-shrink-0">{file.path}</p>
                                        </div>
                                    </button>
                                    
                                    {snippets.length > 0 && (
                                        <div className="pl-6 pr-1 flex flex-col mt-0.5 space-y-0.5">
                                            {snippets.map((snip, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={() => onFileSelect({ id: `file-${file.fileId}`, ...file })}
                                                    className="w-full text-left font-mono text-[11px] leading-relaxed text-gray-400 hover:text-gray-200 hover:bg-[#535C91]/20 p-1 rounded transition-colors truncate"
                                                    title={snip.text}
                                                >
                                                    <span className="text-gray-600 select-none mr-2.5 inline-block min-w-[20px] text-right">{snip.lineNum}</span>
                                                    {renderTextWithHighlight(snip.text, query)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : query.length > 2 ? (
                <div className="mt-8 text-center px-4">
                    <p className="text-xs text-gray-500">No results found for "{query}"</p>
                </div>
            ) : null}
        </div>
    );
}