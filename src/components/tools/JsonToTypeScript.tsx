import { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { FileJson, Settings, Braces } from 'lucide-react';

export default function JsonToTypeScript() {
  const [input, setInput] = useState('{\n  "id": 1,\n  "name": "John Doe",\n  "isActive": true,\n  "tags": ["admin", "staff"],\n  "profile": {\n    "bio": "Software Engineer",\n    "age": 30,\n    "links": {\n      "github": "https://github.com",\n      "twitter": "@johndoe"\n    }\n  },\n  "projects": [\n    {\n      "id": "p1",\n      "title": "Project Alpha",\n      "stars": 120\n    },\n    {\n      "id": "p2",\n      "title": "Project Beta",\n      "description": "Optional field"\n    }\n  ]\n}');
  const [output, setOutput] = useState('');
  const [rootName, setRootName] = useState('RootObject');
  const [useInterface, setUseInterface] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!val.trim()) {
      setError(null);
      return;
    }
    try {
      JSON.parse(val);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const generate = () => {
    if (!input.trim()) return;

    try {
      const obj = JSON.parse(input);
      setError(null);
      const interfaces: string[] = [];
      const seenInterfaces = new Map<string, string>();

      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

      const getType = (val: any, key: string): string => {
        if (val === null) return 'any';
        if (Array.isArray(val)) {
          if (val.length === 0) return 'any[]';
          
          // Check if it's an array of objects
          const first = val[0];
          if (typeof first === 'object' && first !== null) {
            const typeName = capitalize(key.replace(/s$/, '')) || 'Item';
            return `${processObject(first, typeName)}[]`;
          }
          
          return `${typeof first}[]`;
        }
        
        if (typeof val === 'object') {
          const typeName = capitalize(key);
          return processObject(val, typeName);
        }
        
        return typeof val;
      };

      const processObject = (val: any, name: string): string => {
        let definition = useInterface ? `interface ${name} {\n` : `type ${name} = {\n`;
        
        for (const [k, v] of Object.entries(val)) {
          const type = getType(v, k);
          definition += `  ${k}: ${type};\n`;
        }
        
        definition += '}';
        
        // Simple deduplication based on content (ignoring name)
        const content = definition.substring(definition.indexOf('{'));
        if (seenInterfaces.has(content)) {
          return seenInterfaces.get(content)!;
        }

        // Handle name collisions
        let uniqueName = name;
        let counter = 1;
        while (interfaces.some(i => i.startsWith(`${useInterface ? 'interface' : 'type'} ${uniqueName} `))) {
          uniqueName = `${name}${counter++}`;
        }

        // Re-generate with unique name
        definition = useInterface ? `interface ${uniqueName} {\n` : `type ${uniqueName} = {\n`;
        for (const [k, v] of Object.entries(val)) {
          const type = getType(v, k);
          definition += `  ${k}: ${type};\n`;
        }
        definition += '}';

        interfaces.push(definition);
        seenInterfaces.set(content, uniqueName);
        return uniqueName;
      };

      processObject(obj, rootName);
      setOutput(interfaces.reverse().join('\n\n'));
    } catch (e) {
      setOutput('Error: Invalid JSON input');
    }
  };

  return (
    <ToolLayout
      title="JSON to TypeScript"
      description="Convert JSON data into clean, nested TypeScript interfaces or types."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-bg-header border border-border-main rounded-lg px-3 py-1.5 overflow-hidden">
            <Braces size={12} className="text-text-secondary" />
            <input 
              type="text" 
              value={rootName}
              onChange={(e) => setRootName(e.target.value || 'Root')}
              placeholder="Root Name"
              className="bg-transparent text-[10px] text-text-main outline-none w-24 font-mono"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-bg-header p-1 rounded-lg border border-border-main">
            <button 
              onClick={() => setUseInterface(true)}
              className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${useInterface ? 'bg-brand text-white shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
            >
              Interface
            </button>
            <button 
              onClick={() => setUseInterface(false)}
              className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${!useInterface ? 'bg-brand text-white shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
            >
              Type
            </button>
          </div>

          <button 
            onClick={generate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-bold transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            Generate
          </button>
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FileJson size={14} className="text-brand" />
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">JSON Payload</label>
            </div>
            <div className="text-[10px] font-mono text-text-secondary opacity-50">UTF-8</div>
          </div>
          <div className="flex-1 min-h-0 rounded-2xl border border-border-main overflow-hidden bg-bg-editor shadow-inner">
            <CodeEditor
              value={input}
              onChange={handleInputChange}
              language="json"
              placeholder="Paste your JSON here..."
              error={error}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-brand" />
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">TypeScript Definitions</label>
            </div>
            <div className="text-[10px] font-mono text-text-secondary bg-bg-header px-2 py-0.5 rounded border border-border-main">
              .ts
            </div>
          </div>
          <div className="flex-1 min-h-0 rounded-2xl border border-border-main overflow-hidden bg-bg-editor shadow-inner">
            <CodeEditor
              value={output}
              onChange={() => {}}
              language="typescript"
              readOnly
              placeholder="Generated TypeScript interfaces will appear here..."
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
