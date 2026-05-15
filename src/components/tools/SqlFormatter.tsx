import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { format } from 'sql-formatter';

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState('sql');
  const [error, setError] = useState<string | null>(null);

  const formatSql = () => {
    if (!input.trim()) return;
    try {
      const formatted = format(input, {
        language: dialect as any,
        // Remove invalid uppercase property
      });
      setOutput(formatted);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!val.trim()) {
      setError(null);
      return;
    }
    // Basic catch for obvious errors if needed, though sql-formatter is forgiving
    try {
       format(val, { language: dialect as any });
       setError(null);
    } catch (err) {
       setError((err as Error).message);
    }
  };

  return (
    <ToolLayout 
      title="SQL Formatter" 
      description="Beautify and format your SQL queries for better readability."
      onClear={() => { setInput(''); setOutput(''); setError(null); }}
      actions={
        <div className="flex items-center gap-2">
          <select 
            className="bg-bg-header border border-border-subtle rounded py-1 px-2 text-xs text-text-secondary outline-none mr-2"
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
          >
            <option value="sql">Standard SQL</option>
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="tsql">T-SQL (SQL Server)</option>
          </select>
          <button 
            onClick={formatSql}
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
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">SQL Query</label>
          <CodeEditor 
            value={input} 
            onChange={handleInputChange} 
            language="sql" 
            placeholder="SELECT * FROM users WHERE active = true..."
            error={error}
          />
        </div>

        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Output</label>
          <CodeEditor 
            value={output} 
            onChange={() => {}} 
            language="sql" 
            readOnly 
            placeholder="Formatted output will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
