import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';

export default function CaseConverter() {
  const [input, setInput] = useState('');

  const converters = [
    { name: 'Lower Case', fn: (s: string) => s.toLowerCase() },
    { name: 'Upper Case', fn: (s: string) => s.toUpperCase() },
    { name: 'Camel Case', fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '') },
    { name: 'Pascal Case', fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase()).replace(/\s+/g, '') },
    { name: 'Snake Case', fn: (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || '' },
    { name: 'Kebab Case', fn: (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || '' },
    { name: 'Title Case', fn: (s: string) => s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) },
  ];

  return (
    <ToolLayout 
      title="Case Converter" 
      description="Convert text between different case styles like camelCase, snake_case, and more."
      onClear={() => setInput('')}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Input Text</label>
          <textarea 
            className="w-full min-h-[120px] bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm outline-none focus:border-blue-500/50 transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type anything here..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {converters.map(conv => {
            const result = input ? conv.fn(input) : '';
            return (
              <div key={conv.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-500">{conv.name}</label>
                  {result && <CopyButton text={result} />}
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-sm truncate text-slate-300">
                  {result || <span className="text-slate-600 italic">No input...</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
