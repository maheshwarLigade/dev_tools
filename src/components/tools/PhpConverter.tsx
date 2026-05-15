import { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { RefreshCw } from 'lucide-react';

export default function PhpConverter() {
  const [input, setInput] = useState('[\n  "id" => 1,\n  "name" => "John Doe",\n  "active" => true,\n  "scores" => [90, 85, 88]\n]');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'php-to-json' | 'json-to-php'>('php-to-json');

  const convert = () => {
    if (!input.trim()) return;

    if (mode === 'php-to-json') {
      // Basic PHP array to JSON conversion (regex based)
      let json = input.trim();
      
      // Convert => to :
      json = json.replace(/=>/g, ':');
      
      // Convert PHP array brackets [] or array() to JSON brackets [] or {}
      // This is very simplified and might fail on complex nested structures
      // Real apps would use a PHP parser in JS
      json = json.replace(/\[/g, '{').replace(/\]/g, '}');
      
      // Wrap keys in double quotes if not already
      json = json.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
      
      // Attempt to prettify
      try {
        const obj = JSON.parse(json);
        setOutput(JSON.stringify(obj, null, 2));
      } catch (e) {
        // If parsing fails, just show the regex result
        setOutput(json);
      }
    } else {
      // JSON to PHP array
      try {
        const obj = JSON.parse(input);
        const toPhp = (val: any, indent: string = ''): string => {
          if (Array.isArray(val)) {
            return '[\n' + val.map(v => indent + '  ' + toPhp(v, indent + '  ')).join(',\n') + '\n' + indent + ']';
          } else if (typeof val === 'object' && val !== null) {
            return '[\n' + Object.entries(val).map(([k, v]) => indent + '  "' + k + '" => ' + toPhp(v, indent + '  ')).join(',\n') + '\n' + indent + ']';
          } else if (typeof val === 'string') {
            return '"' + val + '"';
          }
          return String(val);
        };
        setOutput(toPhp(obj));
      } catch (e) {
        setOutput('Error: Invalid JSON input');
      }
    }
  };

  return (
    <ToolLayout
      title="PHP Array / JSON Converter"
      description="Convert between PHP associative arrays and JSON strings."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setMode(mode === 'php-to-json' ? 'json-to-php' : 'php-to-json')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
          >
            <RefreshCw size={14} />
            <span>Switch to {mode === 'php-to-json' ? 'JSON to PHP' : 'PHP to JSON'}</span>
          </button>
          <button 
            onClick={convert}
            className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs transition-colors shadow-lg shadow-brand/20"
          >
            Convert
          </button>
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
            {mode === 'php-to-json' ? 'PHP Array' : 'JSON'} Input
          </label>
          <CodeEditor
            value={input}
            onChange={setInput}
            language={mode === 'php-to-json' ? 'php' : 'json'}
            placeholder={mode === 'php-to-json' ? 'Paste PHP array here...' : 'Paste JSON here...'}
          />
        </div>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
            {mode === 'php-to-json' ? 'JSON' : 'PHP Array'} Output
          </label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language={mode === 'php-to-json' ? 'json' : 'php'}
            readOnly
            placeholder="Converted output will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
