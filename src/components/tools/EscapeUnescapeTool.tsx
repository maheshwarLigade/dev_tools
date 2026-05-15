import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { RefreshCw } from 'lucide-react';

export default function EscapeUnescapeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');

  const process = (val: string, currentMode: 'escape' | 'unescape') => {
    setInput(val);
    if (!val.trim()) { setOutput(''); return; }

    try {
      if (currentMode === 'escape') {
        setOutput(JSON.stringify(val).slice(1, -1));
      } else {
        setOutput(JSON.parse(`"${val}"`));
      }
    } catch (e) {
      setOutput(`Error: Could not ${currentMode} string. Invalid escape sequence.`);
    }
  };

  const handleSwap = () => {
    const newMode = mode === 'escape' ? 'unescape' : 'escape';
    setMode(newMode);
    process(input, newMode);
  };

  return (
    <ToolLayout 
      title="Backslash Escape/Unescape" 
      description="Escape or unescape special characters like newlines, tabs, and backslashes for use in code."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <button 
          onClick={handleSwap}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
        >
          <RefreshCw size={14} />
          <span>Switch to {mode === 'escape' ? 'Unescape' : 'Escape'}</span>
        </button>
      }
    >
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Input</label>
          <textarea 
            className="flex-1 w-full bg-bg-editor border border-border-main rounded px-4 py-3 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-white"
            value={input}
            onChange={(e) => process(e.target.value, mode)}
            placeholder={mode === 'escape' ? 'Enter text with newlines or special chars...' : 'Enter escaped text (e.g. \\n \\t)...'}
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Result</label>
            {output && <CopyButton text={output} />}
          </div>
          <div className="flex-1 bg-bg-sidebar border border-border-main rounded p-4 font-mono text-sm text-text-main break-all overflow-auto whitespace-pre-wrap">
            {output || <span className="text-text-secondary italic">Result will appear here...</span>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
