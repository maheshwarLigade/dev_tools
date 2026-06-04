import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { Settings, Maximize2, Minimize2 } from 'lucide-react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const validateJson = (val: string) => {
    if (!val.trim()) {
      setError(null);
      return;
    }
    try {
      JSON.parse(val);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    validateJson(val);
  };

  const formatJson = (minify = false) => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, minify ? 0 : indent);
      setOutput(formatted);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleStringify = () => {
    if (!input.trim()) return;
    try {
      // First try to parse it to ensure it's valid JSON
      const parsed = JSON.parse(input);
      // Minify it before stringifying to avoid \n clutter, or use current indent if preferred
      // Usually stringified JSON is minified
      const minified = JSON.stringify(parsed);
      setOutput(JSON.stringify(minified));
      setError(null);
    } catch (err) {
      // If it's not valid JSON, just stringify the raw input
      setOutput(JSON.stringify(input));
      setError(null);
    }
  };

  const handleUnstringify = () => {
    if (!input.trim()) return;
    try {
      let unescaped = input;
      // If the input is wrapped in quotes, JSON.parse will unescape it into a normal string
      if (input.trim().startsWith('"') && input.trim().endsWith('"')) {
         unescaped = JSON.parse(input.trim());
      } else {
         // If they pasted without outer quotes but it has escapes, try to parse it
         unescaped = JSON.parse(`"${input.trim()}"`);
      }
      
      // Now format the unescaped JSON
      const parsed = JSON.parse(unescaped);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (err) {
      setError("Unstringify Error: " + (err as Error).message);
    }
  };

  return (
    <ToolLayout 
      title="JSON Formatter" 
      description="Format, prettify or minify your JSON data with validation."
      onClear={handleClear}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4 bg-bg-header px-2 py-1 rounded border border-border-subtle">
            <Settings size={12} className="text-text-secondary" />
            <select 
              className="bg-transparent text-[10px] text-text-main outline-none"
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
            </select>
          </div>
          <button 
            onClick={handleStringify}
            className="px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
            title="Convert to escaped JSON string"
          >
            Stringify
          </button>
          <button 
            onClick={handleUnstringify}
            className="px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
            title="Parse from escaped JSON string"
          >
            Unstringify
          </button>
          <button 
            onClick={() => formatJson(true)}
            className="px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
          >
            Minify
          </button>
          <button 
            onClick={() => formatJson(false)}
            className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs transition-colors shadow-lg shadow-brand/20"
          >
            Format
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
            onChange={handleInputChange} 
            language="json" 
            placeholder="Paste your JSON here..."
            error={error}
          />
        </div>

        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Output</label>
          <CodeEditor 
            value={output} 
            onChange={() => {}} 
            language="json" 
            readOnly 
            placeholder="Formatted output will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
