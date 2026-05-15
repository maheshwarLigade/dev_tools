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
}

export default function CodeEditor({ value, onChange, language, placeholder, readOnly }: CodeEditorProps) {
  return (
    <div className="flex-1 h-full min-h-[400px] bg-bg-editor border border-border-main rounded overflow-hidden font-mono text-sm relative group flex flex-col shadow-inner">
      <div className="bg-bg-header/80 px-3 py-1 text-[10px] text-text-secondary uppercase border-b border-border-main flex justify-between items-center backdrop-blur-sm">
        <span>{language} editor</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Ready</span>
      </div>
      <div className="flex-1 overflow-auto bg-bg-app">
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
            color: '#9cdcfe', // Light blue typical of VS Code JSON
          }}
        />
      </div>
    </div>
  );
}
