import { useState, useCallback } from 'react';
import ToolLayout from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { faker } from '@faker-js/faker';
import { Database, Plus, Trash2, Download, Play, Copy } from 'lucide-react';

interface Field {
  id: string;
  name: string;
  type: string;
}

const FIELD_TYPES = [
  { label: 'Name (Full)', value: 'person.fullName' },
  { label: 'First Name', value: 'person.firstName' },
  { label: 'Last Name', value: 'person.lastName' },
  { label: 'Email', value: 'internet.email' },
  { label: 'Phone', value: 'phone.number' },
  { label: 'Address', value: 'location.streetAddress' },
  { label: 'City', value: 'location.city' },
  { label: 'Country', value: 'location.country' },
  { label: 'Date (Recent)', value: 'date.recent' },
  { label: 'Company Name', value: 'company.name' },
  { label: 'Job Title', value: 'person.jobTitle' },
  { label: 'UUID', value: 'string.uuid' },
  { label: 'Random Number', value: 'number.int' },
  { label: 'Password', value: 'internet.password' },
  { label: 'Username', value: 'internet.userName' },
  { label: 'Image URL', value: 'image.url' },
  { label: 'Paragraph', value: 'lorem.paragraph' },
  { label: 'Sentence', value: 'lorem.sentence' },
  { label: 'Word', value: 'lorem.word' },
  { label: 'IPv4', value: 'internet.ipv4' },
  { label: 'User Agent', value: 'internet.userAgent' },
  { label: 'MAC Address', value: 'internet.mac' },
  { label: 'Currency Code', value: 'finance.currencyCode' },
  { label: 'Credit Card', value: 'finance.creditCardNumber' },
];

export default function MockDataGenerator() {
  const [fields, setFields] = useState<Field[]>([
    { id: '1', name: 'id', type: 'string.uuid' },
    { id: '2', name: 'fullName', type: 'person.fullName' },
    { id: '3', name: 'email', type: 'internet.email' },
    { id: '4', name: 'joinedAt', type: 'date.recent' },
  ]);
  const [count, setCount] = useState(10);
  const [output, setOutput] = useState('');

  const generateData = useCallback(() => {
    const data = Array.from({ length: count }).map(() => {
      const obj: any = {};
      fields.forEach(field => {
        // Simple mapping from string to faker function
        const parts = field.type.split('.');
        const category = (faker as any)[parts[0]];
        const method = category[parts[1]];
        
        if (typeof method === 'function') {
          obj[field.name] = method.call(category);
        } else {
          obj[field.name] = 'Invalid Type';
        }
      });
      return obj;
    });
    setOutput(JSON.stringify(data, null, 2));
  }, [fields, count]);

  const addField = () => {
    setFields([...fields, { id: Math.random().toString(36).substr(2, 9), name: 'newField', type: 'person.firstName' }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  return (
    <ToolLayout
      title="Mock Data Generator"
      description="Create realistic test data sets for your applications using Faker.js."
      onClear={() => { setOutput(''); }}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4 bg-bg-header border border-border-main rounded-lg px-3 py-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Count</label>
            <input 
               type="number" 
               value={count} 
               onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
               className="w-16 bg-transparent text-sm font-mono text-white outline-none"
            />
          </div>
          <button 
            onClick={generateData}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand hover:bg-brand/90 text-white text-xs font-bold transition-all shadow-lg shadow-brand/20"
          >
            <Play size={14} />
            Generate
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between pl-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Schema Fields</label>
            <button 
              onClick={addField}
              className="flex items-center gap-1.5 text-[10px] font-bold text-brand hover:text-brand-light transition-colors uppercase tracking-widest"
            >
              <Plus size={14} />
              Add Field
            </button>
          </div>
          
          <div className="flex-1 overflow-auto bg-bg-sidebar border border-border-main rounded-2xl p-4 space-y-2">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center gap-3 bg-bg-header/50 border border-border-main p-3 rounded-xl group hover:border-brand/30 transition-all">
                <div className="flex-1 space-y-1">
                  <input 
                    type="text" 
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    className="w-full bg-transparent text-xs font-bold font-mono text-white outline-none focus:text-brand"
                    placeholder="field_name"
                  />
                  <select 
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value })}
                    className="w-full bg-transparent text-[10px] text-text-secondary outline-none cursor-pointer hover:text-text-main transition-colors uppercase font-bold tracking-tight"
                  >
                    {FIELD_TYPES.map(type => (
                      <option key={type.value} value={type.value} className="bg-[#111]">{type.label}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => removeField(field.id)}
                  className="p-2 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-bg-header/50 border border-border-main border-dashed rounded-2xl">
             <div className="flex items-center gap-2 mb-2 text-brand">
                <Database size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Storage Note</span>
             </div>
             <p className="text-[10px] text-text-secondary leading-relaxed italic">
               Large datasets (1000+ items) may slow down the interface. Generated data is stored in memory and not persisted.
             </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex items-center justify-between pl-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Output (JSON)</label>
            {output && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const blob = new Blob([output], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `mock-data-${Date.now()}.json`;
                    a.click();
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary hover:text-text-main transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
                <div className="h-4 w-px bg-border-main" />
                <button 
                   onClick={() => navigator.clipboard.writeText(output)}
                   className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary hover:text-text-main transition-colors"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0 bg-bg-editor border border-border-main rounded-2xl overflow-hidden shadow-2xl">
            <CodeEditor
              value={output}
              onChange={setOutput}
              language="json"
              placeholder="Click 'Generate' to see mock data..."
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
