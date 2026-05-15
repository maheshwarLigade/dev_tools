import { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { RefreshCw } from 'lucide-react';

export default function PhpSerializer() {
  const [input, setInput] = useState('a:2:{s:2:"id";i:1;s:4:"name";s:8:"John Doe";}');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'unserialize' | 'serialize'>('unserialize');

  // Basic PHP Unserializer implementation for browser (limited support)
  const unserialize = (data: string): any => {
    let offset = 0;
    
    const readUntil = (count: number): string => {
      const s = data.slice(offset, offset + count);
      offset += count;
      return s;
    };

    const readTo = (delim: string): string => {
      const idx = data.indexOf(delim, offset);
      if (idx === -1) throw new Error('Invalid serialization');
      const s = data.slice(offset, idx);
      offset = idx + 1;
      return s;
    };

    const parse = (): any => {
      const type = readUntil(2);
      switch (type) {
        case 'i:': return parseInt(readTo(';'), 10);
        case 's:': {
          const len = parseInt(readTo(':'), 10);
          readUntil(1); // "
          const s = readUntil(len);
          readUntil(2); // ";
          return s;
        }
        case 'a:': {
          const len = parseInt(readTo(':'), 10);
          readUntil(1); // {
          const obj: any = {};
          let isArr = true;
          for (let i = 0; i < len; i++) {
            const k = parse();
            const v = parse();
            obj[k] = v;
            if (k !== i) isArr = false;
          }
          readUntil(1); // }
          return isArr ? Object.values(obj) : obj;
        }
        case 'b:': return readTo(';') === '1';
        case 'N;': return null;
        default: return null;
      }
    };

    try {
      return parse();
    } catch (e) {
      return { error: 'Failed to unserialize. Complex objects/types not supported in this preview.' };
    }
  };

  const process = () => {
    if (!input.trim()) return;
    if (mode === 'unserialize') {
      const obj = unserialize(input);
      setOutput(JSON.stringify(obj, null, 2));
    } else {
      setOutput('Serializing JSON to PHP is not yet supported in this preview.');
    }
  };

  return (
    <ToolLayout
      title="PHP Serializer"
      description="Unserialize PHP data to JSON or serialize JSON to PHP (Beta)."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setMode(mode === 'serialize' ? 'unserialize' : 'serialize')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
          >
            <RefreshCw size={14} />
            <span>Switch to {mode === 'serialize' ? 'Unserialize' : 'Serialize'}</span>
          </button>
          <button 
            onClick={process}
            className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs transition-colors shadow-lg shadow-brand/20"
          >
            Process
          </button>
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Input</label>
          <CodeEditor
            value={input}
            onChange={setInput}
            language="text"
            placeholder="Paste serialized PHP string here..."
          />
        </div>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Output (JSON)</label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language="json"
            readOnly
            placeholder="Parsed result will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
