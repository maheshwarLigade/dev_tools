import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { RefreshCw } from 'lucide-react';

export default function HtmlEntitiesTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = (val: string, currentMode: 'encode' | 'decode') => {
    setInput(val);
    if (!val.trim()) { setOutput(''); return; }

    if (currentMode === 'encode') {
      const el = document.createElement('div');
      el.innerText = val;
      setOutput(el.innerHTML);
    } else {
      const el = document.createElement('div');
      el.innerHTML = val;
      setOutput(el.innerText);
    }
  };

  const handleSwap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    process(input, newMode);
  };

  return (
    <ToolLayout 
      title="HTML Entities Encoder/Decoder" 
      description="Encode special characters into HTML entities or decode entities back to text."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <button 
          onClick={handleSwap}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
        >
          <RefreshCw size={14} />
          <span>Switch to {mode === 'encode' ? 'Decode' : 'Encode'}</span>
        </button>
      }
    >
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
            {mode === 'encode' ? 'Plain Text' : 'Encoded Entities'}
          </label>
          <textarea 
            className="flex-1 w-full bg-bg-editor border border-border-main rounded px-4 py-3 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-white"
            value={input}
            onChange={(e) => process(e.target.value, mode)}
            placeholder={mode === 'encode' ? 'Enter text (e.g. < > & " \')' : 'Enter entities (e.g. &lt; &gt; &amp;)'}
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
