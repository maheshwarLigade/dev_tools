import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { ArrowRightLeft } from 'lucide-react';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = (val: string, currentMode: 'encode' | 'decode') => {
    setInput(val);
    if (!val.trim()) {
      setOutput('');
      return;
    }

    try {
      if (currentMode === 'encode') {
        setOutput(btoa(val));
      } else {
        setOutput(atob(val));
      }
    } catch (err) {
      setOutput(`Error: Invalid input for ${currentMode}`);
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    // Swap input and output if they exist
    if (output && !output.startsWith('Error:')) {
      const oldOutput = output;
      const oldInput = input;
      setInput(oldOutput);
      setOutput(oldInput);
    }
  };

  return (
    <ToolLayout 
      title="Base64 Encoder/Decoder" 
      description="Easily encode or decode text to/from Base64 format."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <button 
          onClick={toggleMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors border border-slate-700"
        >
          <ArrowRightLeft size={14} />
          <span>{mode === 'encode' ? 'Switch to Decode' : 'Switch to Encode'}</span>
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">
            {mode === 'encode' ? 'Plain Text' : 'Base64 Hash'}
          </label>
          <textarea 
            className="flex-1 min-h-[160px] bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm outline-none focus:border-blue-500/50 transition-colors"
            value={input}
            onChange={(e) => process(e.target.value, mode)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter base64 to decode...'}
          />
        </div>

        <div className="flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              {mode === 'encode' ? 'Base64 Result' : 'Decoded Text'}
            </label>
            {output && <CopyButton text={output} />}
          </div>
          <div className="min-h-[160px] bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm break-all whitespace-pre-wrap overflow-auto">
            {output || <span className="text-slate-600">Output will appear here...</span>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
