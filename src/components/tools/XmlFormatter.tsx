import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { html as beautifyHtml } from 'js-beautify';

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateXml = (val: string) => {
    if (!val.trim()) {
      setError(null);
      return;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(val, 'text/xml');
    const parserError = doc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      setError(parserError[0].textContent);
    } else {
      setError(null);
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    validateXml(val);
  };

  const formatXml = (minify = false) => {
    if (!input.trim()) return;
    try {
      if (minify) {
        setOutput(input.replace(/>\s+</g, '><').trim());
      } else {
        const formatted = beautifyHtml(input, {
          indent_size: 2,
          indent_char: ' ',
          max_preserve_newlines: 1,
          preserve_newlines: true,
          wrap_line_length: 0,
          unformatted: [],
          end_with_newline: true
        });
        setOutput(formatted);
      }
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <ToolLayout 
      title="XML Formatter" 
      description="Beautify or minify XML and HTML documents."
      onClear={() => { setInput(''); setOutput(''); setError(null); }}
      actions={
        <div className="flex gap-2">
          <button 
            onClick={() => formatXml(false)} 
            className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs transition-colors shadow-lg shadow-brand/20"
          >
            Beautify
          </button>
          <button 
            onClick={() => formatXml(true)} 
            className="px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
          >
            Minify
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
            language="markup" 
            placeholder="Paste XML or HTML here..." 
            error={error}
          />
        </div>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Output</label>
          <CodeEditor 
            value={output} 
            onChange={() => {}} 
            language="markup" 
            readOnly 
            placeholder="Formatted output will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
