import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
  error?: string | null;
}

export default function CodeEditor({ value, onChange, language, placeholder, readOnly, error }: CodeEditorProps) {
  return (
    <div className={`flex-1 h-full min-h-[400px] bg-bg-editor border ${error ? 'border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]' : 'border-border-main'} rounded overflow-hidden font-mono text-sm relative group flex flex-col transition-all duration-300`}>
      <div className={`px-3 py-1 text-[10px] uppercase border-b flex justify-between items-center backdrop-blur-sm transition-colors duration-300 ${
        error ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-bg-header/80 text-text-secondary border-border-main'
      }`}>
        <div className="flex items-center gap-2">
          <span>{language} editor</span>
          {error && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          {error ? 'Invalid Syntax' : 'Ready'}
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-bg-app relative">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={code => highlight(code, languages[language] || languages.markup, language)}
          padding={16}
          placeholder={placeholder}
          readOnly={readOnly}
          className="code-editor focus:outline-none min-h-full"
          style={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: 13,
            color: error ? '#ff7b72' : '#9cdcfe',
          }}
        />
        {error && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-red-500/10 backdrop-blur-md border-t border-red-500/20 pointer-events-none">
            <p className="text-red-500 text-[10px] font-bold leading-tight uppercase mb-1 tracking-wider">Parser Error</p>
            <p className="text-red-400/90 text-[11px] font-mono leading-relaxed line-clamp-2">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
