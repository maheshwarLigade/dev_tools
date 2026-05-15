import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { RefreshCw } from 'lucide-react';

export default function LoremGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [type, setType] = useState<'paragraphs' | 'words' | 'sentences'>('paragraphs');
  const [result, setResult] = useState('');

  const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  const generate = () => {
    let text = '';
    if (type === 'paragraphs') {
      text = Array(paragraphs).fill(LOREM).join('\n\n');
    } else if (type === 'words') {
      text = LOREM.split(' ').slice(0, paragraphs).join(' ');
    } else {
      text = LOREM.split('.').slice(0, paragraphs).join('.') + '.';
    }
    setResult(text);
  };

  React.useEffect(generate, [paragraphs, type]);

  return (
    <ToolLayout 
      title="Lorem Ipsum Generator" 
      description="Generate placeholder text for layouts and design prototypes."
      actions={
        <div className="flex items-center gap-4">
          <select 
            className="bg-slate-800 border border-slate-700 rounded-md py-1 px-2 text-xs text-slate-300 outline-none"
            value={type}
            onChange={(e: any) => setType(e.target.value)}
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
          <input 
            type="number" 
            min={1} 
            max={50}
            className="w-16 bg-slate-800 border border-slate-700 rounded-md py-1 px-2 text-xs text-slate-300"
            value={paragraphs}
            onChange={(e) => setParagraphs(Number(e.target.value))}
          />
          <button 
            onClick={generate}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-md px-3 py-1.5 text-xs font-medium"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500 uppercase">Generated Text</label>
          <CopyButton text={result} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-slate-300 leading-relaxed min-h-[300px]">
          {result}
        </div>
      </div>
    </ToolLayout>
  );
}
