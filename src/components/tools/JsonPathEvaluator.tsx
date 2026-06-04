import React, { useState, useEffect } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { JSONPath } from 'jsonpath-plus';

export default function JsonPathEvaluator() {
  const [input, setInput] = useState('{\n  "store": {\n    "book": [\n      { "category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95 },\n      { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 }\n    ]\n  }\n}');
  const [path, setPath] = useState('$.store.book[*].author');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const evaluate = () => {
    if (!input.trim() || !path.trim()) {
      setOutput('');
      return;
    }
    try {
      const json = JSON.parse(input);
      setError(null);
      
      try {
        const result = JSONPath({ path, json });
        setOutput(JSON.stringify(result, null, 2));
      } catch (pathErr) {
        setError("Invalid JSONPath: " + (pathErr as Error).message);
        setOutput('');
      }
    } catch (err) {
      setError("Invalid JSON: " + (err as Error).message);
      setOutput('');
    }
  };

  useEffect(() => {
    evaluate();
  }, [input, path]);

  const handleClear = () => {
    setInput('');
    setPath('');
    setOutput('');
    setError(null);
  };

  return (
    <ToolLayout 
      title="JSONPath Evaluator" 
      description="Evaluate JSONPath expressions against your JSON data in real-time."
      onClear={handleClear}
      actions={<CopyButton text={output} />}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-col gap-1 shrink-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">JSONPath Expression</label>
          <input
            type="text"
            className="w-full bg-bg-header border border-border-subtle rounded py-2 px-3 text-sm text-text-main outline-none focus:border-brand transition-colors font-mono"
            placeholder="$.store.book[*].author"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-2 h-full min-h-0">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">JSON Input</label>
            <CodeEditor 
              value={input} 
              onChange={setInput} 
              language="json" 
              placeholder="Paste your JSON here..."
              error={error?.startsWith('Invalid JSON') ? error : null}
            />
          </div>

          <div className="flex flex-col gap-2 h-full min-h-0">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Evaluation Result</label>
            <CodeEditor 
              value={output} 
              onChange={() => {}} 
              language="json" 
              readOnly 
              placeholder="Result will appear here..."
              error={error?.startsWith('Invalid JSONPath') ? error : null}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
