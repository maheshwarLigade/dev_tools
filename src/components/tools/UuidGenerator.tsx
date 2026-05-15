import React, { useState, useEffect } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { v4 as uuidv4, v1 as uuidv1, v5 as uuidv5 } from 'uuid';
import { RefreshCw, Plus } from 'lucide-react';

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [version, setVersion] = useState<'v4' | 'v1'>('v4');

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => 
      version === 'v4' ? uuidv4() : uuidv1()
    );
    setUuids(newUuids);
  };

  useEffect(() => {
    generate();
  }, []);

  return (
    <ToolLayout 
      title="UUID/ULID Generator" 
      description="Generate unique identifiers (Version 1 and 4) in various formats."
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Count:</label>
            <input 
              type="number" 
              min={1} 
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-16 bg-slate-800 border border-slate-700 rounded-md py-1 px-2 text-xs text-slate-300 outline-none"
            />
          </div>
          <select 
            className="bg-slate-800 border border-slate-700 rounded-md py-1 px-2 text-xs text-slate-300 outline-none"
            value={version}
            onChange={(e) => setVersion(e.target.value as any)}
          >
            <option value="v4">UUID v4 (Random)</option>
            <option value="v1">UUID v1 (Time-based)</option>
          </select>
          <button 
            onClick={generate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
          >
            <RefreshCw size={14} className={uuids.length === 0 ? 'animate-spin' : ''} />
            <span>Generate</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-500 uppercase">Generated UUIDs</h3>
          {uuids.length > 0 && <CopyButton text={uuids.join('\n')} />}
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          {uuids.map((uuid, i) => (
            <div 
              key={i} 
              className={`p-4 font-mono text-sm flex items-center justify-between group hover:bg-slate-800/50 transition-colors ${
                i !== uuids.length - 1 ? 'border-b border-slate-800' : ''
              }`}
            >
              <span className="text-blue-400 font-bold mr-4">{i + 1}.</span>
              <span className="flex-1 text-slate-200">{uuid}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(uuid)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-blue-400 text-slate-500 transition-all"
                title="Copy single UUID"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
