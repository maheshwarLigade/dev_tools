import { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { RefreshCw } from 'lucide-react';

export default function HexAsciiConverter() {
  const [input, setInput] = useState('48 65 6c 6c 6f 20 57 6f 72 6c 64');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'hex-to-ascii' | 'ascii-to-hex'>('hex-to-ascii');

  const process = (val: string, currentMode: 'hex-to-ascii' | 'ascii-to-hex') => {
    setInput(val);
    if (!val.trim()) { setOutput(''); return; }

    try {
      if (currentMode === 'hex-to-ascii') {
        const hex = val.replace(/\s+/g, '');
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        setOutput(str);
      } else {
        let hex = '';
        for (let i = 0; i < val.length; i++) {
          hex += val.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
        }
        setOutput(hex.trim().toUpperCase());
      }
    } catch (e) {
      setOutput('Error: Invalid input for conversion');
    }
  };

  const handleSwap = () => {
    const newMode = mode === 'hex-to-ascii' ? 'ascii-to-hex' : 'hex-to-ascii';
    setMode(newMode);
    process(input, newMode);
  };

  return (
    <ToolLayout 
      title="Hex / ASCII Converter" 
      description="Convert between Hexadecimal representations and plain ASCII text."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <button 
          onClick={handleSwap}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
        >
          <RefreshCw size={14} />
          <span>Switch to {mode === 'hex-to-ascii' ? 'ASCII to Hex' : 'Hex to ASCII'}</span>
        </button>
      }
    >
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
            {mode === 'hex-to-ascii' ? 'Hex Input' : 'ASCII Input'}
          </label>
          <textarea 
            className="flex-1 w-full bg-bg-editor border border-border-main rounded px-4 py-3 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-white"
            value={input}
            onChange={(e) => process(e.target.value, mode)}
            placeholder={mode === 'hex-to-ascii' ? 'e.g. 48 65 6c 6c 6f' : 'e.g. Hello'}
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
