import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { format } from 'sql-formatter';

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState('sql');

  const formatSql = () => {
    if (!input.trim()) return;
    try {
      const formatted = format(input, {
        language: dialect as any,
        // Remove invalid uppercase property
      });
      setOutput(formatted);
    } catch (err) {
      setOutput(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <ToolLayout 
      title="SQL Formatter" 
      description="Beautify and format your SQL queries for better readability."
      onClear={() => { setInput(''); setOutput(''); }}
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
            onChange={setInput} 
            language="sql" 
            placeholder="SELECT * FROM users WHERE active = true..."
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
