import { useState, useCallback } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';

export default function SvgToCss() {
  const [input, setInput] = useState('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>');
  const [output, setOutput] = useState('');

  const convert = useCallback(() => {
    if (!input.trim()) return;

    // URI Encode SVG
    let encoded = input.trim();
    
    // Replace double quotes with single quotes to avoid CSS issues
    encoded = encoded.replace(/"/g, "'");
    
    // Basic replacements for cleaner Data URI
    encoded = encoded
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/{/g, '%7B')
      .replace(/}/g, '%7D')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E');
    
    const dataUri = `data:image/svg+xml,${encoded}`;
    const css = `.icon {\n  background-image: url("${dataUri}");\n  background-repeat: no-repeat;\n  background-size: contain;\n  width: 24px;\n  height: 24px;\n}`;
    
    setOutput(css);
  }, [input]);

  return (
    <ToolLayout
      title="SVG to CSS"
      description="Convert SVG code to a CSS background-image Data URI."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <div className="flex gap-2">
          <button 
            onClick={convert}
            className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs transition-colors shadow-lg shadow-brand/20"
          >
            Generate CSS
          </button>
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">SVG Input</label>
          <CodeEditor
            value={input}
            onChange={setInput}
            language="html"
            placeholder="Paste <svg> code here..."
          />
        </div>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">CSS Output</label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language="css"
            readOnly
            placeholder="Generated CSS will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
