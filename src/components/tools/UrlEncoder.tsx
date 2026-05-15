import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { RefreshCw } from 'lucide-react';

export default function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = (val: string, currentMode: 'encode' | 'decode') => {
    setInput(val);
    try {
      if (currentMode === 'encode') {
        setOutput(encodeURIComponent(val));
      } else {
        setOutput(decodeURIComponent(val));
      }
    } catch (e) {
      setOutput('Error: Invalid URI sequence');
    }
  };

  return (
    <ToolLayout 
      title="URL Encoder/Decoder" 
      description="Encode special characters for URLs or decode encoded strings."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <button 
          onClick={() => {
            const newMode = mode === 'encode' ? 'decode' : 'encode';
            setMode(newMode);
            process(input, newMode);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors border border-slate-700"
        >
          <RefreshCw size={14} />
          <span>Switch to {mode === 'encode' ? 'Decode' : 'Encode'}</span>
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Input</label>
          <textarea 
            className="w-full min-h-[160px] bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm outline-none focus:border-blue-500/50 transition-colors"
            value={input}
            onChange={(e) => process(e.target.value, mode)}
            placeholder={mode === 'encode' ? 'URL to encode...' : 'Encoded string to decode...'}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase">Result</label>
            {output && <CopyButton text={output} />}
          </div>
          <div className="min-h-[160px] bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm break-all">
            {output || <span className="text-slate-600 italic">Result will appear here...</span>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
