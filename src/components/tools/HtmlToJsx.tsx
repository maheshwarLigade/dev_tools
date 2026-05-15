import { useState, useCallback } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';

export default function HtmlToJsx() {
  const [input, setInput] = useState('<div class="container" style="background-color: red;">\n  <label for="name">Name:</label>\n  <input type="text" id="name" onclick="alert(\'hello\')">\n</div>');
  const [output, setOutput] = useState('');

  const convert = useCallback(() => {
    if (!input.trim()) return;
    
    let result = input;
    
    // Replace class with className
    result = result.replace(/class=/g, 'className=');
    
    // Replace for with htmlFor
    result = result.replace(/for=/g, 'htmlFor=');
    
    // Replace event handlers
    result = result.replace(/onclick=/g, 'onClick=');
    result = result.replace(/onchange=/g, 'onChange=');
    result = result.replace(/onfocus=/g, 'onFocus=');
    result = result.replace(/onblur=/g, 'onBlur=');
    
    // Replace style strings with objects (basic support)
    result = result.replace(/style="([^"]*)"/g, (match, styleStr) => {
      const styles = styleStr.split(';').filter((s: string) => s.trim()).map((s: string) => {
        const [prop, val] = s.split(':').map(str => str.trim());
        const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return `${camelProp}: '${val}'`;
      });
      return `style={{ ${styles.join(', ')} }}`;
    });

    // Close self-closing tags
    const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
    selfClosingTags.forEach(tag => {
      const regex = new RegExp(`<${tag}([^>]*[^/])>`, 'gi');
      result = result.replace(regex, `<${tag}$1 />`);
    });

    setOutput(result);
  }, [input]);

  return (
    <ToolLayout
      title="HTML to JSX"
      description="Convert HTML code snippets to React-friendly JSX code."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <div className="flex gap-2">
          <button 
            onClick={convert}
            className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs transition-colors shadow-lg shadow-brand/20"
          >
            Convert to JSX
          </button>
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">HTML Input</label>
          <CodeEditor
            value={input}
            onChange={setInput}
            language="html"
            placeholder="Paste HTML here..."
          />
        </div>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">JSX Output</label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language="javascript"
            readOnly
            placeholder="JSX output will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
