import { useState, useCallback } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { 
  SortAsc, 
  SortDesc, 
  Zap, 
  Trash2, 
  Filter,
  ArrowUpAZ,
  ArrowDownAZ,
  AlignCenter,
  RefreshCw
} from 'lucide-react';

export default function LineTools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const processLines = useCallback((action: 'sort-asc' | 'sort-desc' | 'dedupe' | 'reverse' | 'trim' | 'remove-empty') => {
    const lines = input.split('\n');
    let processed = [...lines];

    switch (action) {
      case 'sort-asc':
        processed.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        break;
      case 'sort-desc':
        processed.sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base' }));
        break;
      case 'dedupe':
        processed = Array.from(new Set(processed));
        break;
      case 'reverse':
        processed.reverse();
        break;
      case 'trim':
        processed = processed.map(line => line.trim());
        break;
      case 'remove-empty':
        processed = processed.filter(line => line.trim() !== '');
        break;
    }

    setOutput(processed.join('\n'));
  }, [input]);

  return (
    <ToolLayout
      title="Line Sort/Dedupe"
      description="Sort, reverse, remove duplicates and clean up lines of text."
      onClear={() => {
        setInput('');
        setOutput('');
      }}
      actions={
        <div className="flex items-center gap-2">
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="flex flex-col h-full gap-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 p-3 bg-bg-sidebar rounded border border-border-main">
          <button
            onClick={() => processLines('sort-asc')}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-header hover:bg-neutral-700 text-text-secondary hover:text-text-main text-xs transition-colors border border-border-subtle"
            title="Sort A-Z"
          >
            <ArrowUpAZ size={14} />
            <span>Sort A-Z</span>
          </button>
          <button
            onClick={() => processLines('sort-desc')}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-header hover:bg-neutral-700 text-text-secondary hover:text-text-main text-xs transition-colors border border-border-subtle"
            title="Sort Z-A"
          >
            <ArrowDownAZ size={14} />
            <span>Sort Z-A</span>
          </button>
          <div className="w-px h-4 bg-border-main mx-1 self-center" />
          <button
            onClick={() => processLines('dedupe')}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-header hover:bg-neutral-700 text-text-secondary hover:text-text-main text-xs transition-colors border border-border-subtle"
            title="Remove Duplicates"
          >
            <Filter size={14} />
            <span>Deduplicate</span>
          </button>
          <button
            onClick={() => processLines('remove-empty')}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-header hover:bg-neutral-700 text-text-secondary hover:text-text-main text-xs transition-colors border border-border-subtle"
            title="Remove Empty Lines"
          >
            <Zap size={14} />
            <span>Clean Empty</span>
          </button>
          <button
            onClick={() => processLines('trim')}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-header hover:bg-neutral-700 text-text-secondary hover:text-text-main text-xs transition-colors border border-border-subtle"
            title="Trim Whitespace"
          >
            <AlignCenter size={14} className="rotate-90" />
            <span>Trim</span>
          </button>
          <button
            onClick={() => processLines('reverse')}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-header hover:bg-neutral-700 text-text-secondary hover:text-text-main text-xs transition-colors border border-border-subtle"
            title="Reverse Order"
          >
            <RefreshCw size={14} />
            <span>Reverse</span>
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          <div className="flex flex-col gap-2 h-full min-h-0">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Input</label>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="text"
              placeholder="Paste your lines here..."
            />
          </div>
          <div className="flex flex-col gap-2 h-full min-h-0">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Output</label>
            <CodeEditor
              value={output}
              onChange={() => {}}
              language="text"
              readOnly
              placeholder="Processed output will appear here..."
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
