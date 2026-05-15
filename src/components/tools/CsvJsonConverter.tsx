import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import Papa from 'papaparse';
import { ArrowRightLeft } from 'lucide-react';

export default function CsvJsonConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState<'csv2json' | 'json2csv'>('csv2json');

  const convert = (val: string, dir: 'csv2json' | 'json2csv') => {
    setInput(val);
    if (!val.trim()) { setOutput(''); return; }

    try {
      if (dir === 'csv2json') {
        const results = Papa.parse(val, { header: true, skipEmptyLines: true });
        setOutput(JSON.stringify(results.data, null, 2));
      } else {
        const obj = JSON.parse(val);
        const csv = Papa.unparse(obj);
        setOutput(csv);
      }
    } catch (err) {
      setOutput(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <ToolLayout 
      title="CSV/JSON Converter" 
      description="Convert data between CSV and JSON formats effortlessly."
      actions={
        <button 
          onClick={() => {
            const next = direction === 'csv2json' ? 'json2csv' : 'csv2json';
            setDirection(next);
            if (output && !output.startsWith('Error:')) {
              const oldOut = output; const oldIn = input;
              setInput(oldOut); setOutput(oldIn);
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs"
        >
          <ArrowRightLeft size={14} />
          <span>{direction === 'csv2json' ? 'CSV → JSON' : 'JSON → CSV'}</span>
        </button>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <label className="text-xs font-semibold text-slate-500 uppercase">{direction === 'csv2json' ? 'CSV Input' : 'JSON Input'}</label>
          <CodeEditor value={input} onChange={(v) => convert(v, direction)} language={direction === 'csv2json' ? 'text' : 'json'} />
        </div>
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <CodeEditor value={output} onChange={setOutput} language={direction === 'csv2json' ? 'json' : 'text'} readOnly />
        </div>
      </div>
    </ToolLayout>
  );
}
