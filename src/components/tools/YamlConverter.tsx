import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import yaml from 'js-yaml';
import { ArrowRightLeft } from 'lucide-react';

export default function YamlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState<'yaml2json' | 'json2yaml'>('yaml2json');
  const [error, setError] = useState<string | null>(null);

  const convert = (val: string, dir: 'yaml2json' | 'json2yaml') => {
    setInput(val);
    if (!val.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      if (dir === 'yaml2json') {
        const obj = yaml.load(val);
        setOutput(JSON.stringify(obj, null, 2));
      } else {
        const obj = JSON.parse(val);
        setOutput(yaml.dump(obj));
      }
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSwap = () => {
    const newDir = direction === 'yaml2json' ? 'json2yaml' : 'yaml2json';
    setDirection(newDir);
    if (output && !error) {
      const oldOutput = output;
      const oldInput = input;
      setInput(oldOutput);
      setOutput(oldInput);
    }
  };

  return (
    <ToolLayout 
      title="YAML/JSON Converter" 
      description="Convert between YAML and JSON formats instantly."
      onClear={() => { setInput(''); setOutput(''); setError(null); }}
      actions={
        <button 
          onClick={handleSwap}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors border border-slate-700"
        >
          <ArrowRightLeft size={14} />
          <span>{direction === 'yaml2json' ? 'YAML → JSON' : 'JSON → YAML'}</span>
        </button>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <label className="text-xs font-semibold text-slate-500 uppercase">
            {direction === 'yaml2json' ? 'YAML' : 'JSON'}
          </label>
          <CodeEditor 
            value={input} 
            onChange={(v) => convert(v, direction)} 
            language={direction === 'yaml2json' ? 'yaml' : 'json'} 
            error={error}
          />
        </div>

        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              {direction === 'yaml2json' ? 'JSON Result' : 'YAML Result'}
            </label>
            {output && <CopyButton text={output} />}
          </div>
          <CodeEditor 
            value={output} 
            onChange={setOutput} 
            language={direction === 'yaml2json' ? 'json' : 'yaml'} 
            readOnly 
          />
        </div>
      </div>
    </ToolLayout>
  );
}
