import { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';

export default function JsonToCode() {
  const [input, setInput] = useState('{\n  "id": 1,\n  "name": "John Doe",\n  "tags": ["admin", "staff"],\n  "profile": {\n    "bio": "Developer",\n    "age": 30\n  }\n}');
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState<'typescript' | 'go' | 'java' | 'json-schema'>('typescript');

  const generate = () => {
    if (!input.trim()) return;

    try {
      const obj = JSON.parse(input);
      
      if (lang === 'typescript') {
        const toTs = (val: any, name: string = 'Root'): string => {
          if (Array.isArray(val)) {
             const type = val.length > 0 ? typeof val[0] : 'any';
             return `${type}[]`;
          } else if (typeof val === 'object' && val !== null) {
            let s = '{\n';
            for (const [k, v] of Object.entries(val)) {
              s += `  ${k}: ${typeof v === 'object' && v !== null ? toTs(v, k).replace(/\n/g, '\n  ') : typeof v};\n`;
            }
            s += '}';
            return s;
          }
          return typeof val;
        };
        setOutput(`export interface Root ${toTs(obj)}`);
      } else if (lang === 'go') {
        const toGo = (val: any, name: string = 'Root'): string => {
          let s = `type ${name.charAt(0).toUpperCase() + name.slice(1)} struct {\n`;
          for (const [k, v] of Object.entries(val)) {
            const camelK = k.charAt(0).toUpperCase() + k.slice(1);
            let goType: string = typeof v;
            if (Array.isArray(v)) goType = '[]any';
            else if (goType === 'object') goType = k.charAt(0).toUpperCase() + k.slice(1);
            else if (goType === 'number') goType = 'int';
            
            s += `    ${camelK} ${goType} \`json:"${k}"\`\n`;
          }
          s += '}';
          return s;
        };
        setOutput(toGo(obj));
      } else if (lang === 'json-schema') {
        const toSchema = (val: any): any => {
           const type = Array.isArray(val) ? 'array' : typeof val;
           const schema: any = { type };
           if (type === 'object' && val !== null) {
             schema.properties = {};
             for (const [k, v] of Object.entries(val)) {
               schema.properties[k] = toSchema(v);
             }
           } else if (type === 'array') {
             schema.items = val.length > 0 ? toSchema(val[0]) : {};
           }
           return schema;
        };
        setOutput(JSON.stringify({
          $schema: "http://json-schema.org/draft-07/schema#",
          ...toSchema(obj)
        }, null, 2));
      }
    } catch (e) {
      setOutput('Error: Invalid JSON input');
    }
  };

  return (
    <ToolLayout
      title="JSON to Code / Schema"
      description="Convert JSON data to TypeScript interfaces, Go structs, or JSON Schema."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <div className="flex items-center gap-2">
          <select 
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="bg-bg-header border border-border-subtle rounded py-1 px-2 text-xs text-text-secondary outline-none mr-2"
          >
            <option value="typescript">TypeScript Interface</option>
            <option value="go">Go Struct</option>
            <option value="json-schema">JSON Schema</option>
          </select>
          <button 
            onClick={generate}
            className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs transition-colors shadow-lg shadow-brand/20"
          >
            Generate
          </button>
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">JSON Input</label>
          <CodeEditor
            value={input}
            onChange={setInput}
            language="json"
            placeholder="Paste JSON here..."
          />
        </div>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Output</label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language={lang === 'typescript' ? 'typescript' : lang === 'go' ? 'go' : 'json'}
            readOnly
            placeholder="Code will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
