import { useState, useCallback } from 'react';
import ToolLayout from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import Ajv from 'ajv';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ajv = new Ajv({ allErrors: true });

export default function JsonSchemaValidator() {
  const [jsonInput, setJsonInput] = useState('{\n  "name": "John Doe",\n  "age": 30,\n  "email": "john@example.com"\n}');
  const [schemaInput, setSchemaInput] = useState('{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" },\n    "age": { "type": "number", "minimum": 0 },\n    "email": { "type": "string", "format": "email" }\n  },\n  "required": ["name", "age"]\n}');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors?: any[] | null } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [schemaParseError, setSchemaParseError] = useState<string | null>(null);

  const validateJson = (val: string, setter: (err: string | null) => void) => {
    if (!val.trim()) {
      setter(null);
      return;
    }
    try {
      JSON.parse(val);
      setter(null);
    } catch (e) {
      setter(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const handleJsonChange = (val: string) => {
    setJsonInput(val);
    validateJson(val, setJsonParseError);
  };

  const handleSchemaChange = (val: string) => {
    setSchemaInput(val);
    validateJson(val, setSchemaParseError);
  };

  const validate = useCallback(() => {
    setParseError(null);
    setValidationResult(null);

    try {
      const data = JSON.parse(jsonInput);
      const schema = JSON.parse(schemaInput);

      const validateFn = ajv.compile(schema);
      const valid = validateFn(data);

      setValidationResult({
        valid: !!valid,
        errors: validateFn.errors
      });
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON or Schema format');
    }
  }, [jsonInput, schemaInput]);

  return (
    <ToolLayout
      title="JSON Schema Validator"
      description="Validate JSON data against a JSON Schema to ensure data integrity."
      onClear={() => { setJsonInput(''); setSchemaInput(''); setValidationResult(null); setParseError(null); setJsonParseError(null); setSchemaParseError(null); }}
      actions={
        <button 
          onClick={validate}
          className="px-4 py-2 rounded-md bg-brand hover:bg-brand/90 text-white text-xs font-bold transition-all shadow-lg shadow-brand/20"
        >
          Validate JSON
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">JSON Data</label>
            <CodeEditor
              value={jsonInput}
              onChange={handleJsonChange}
              language="json"
              placeholder="Paste JSON data here..."
              error={jsonParseError}
            />
          </div>
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">JSON Schema</label>
            <CodeEditor
              value={schemaInput}
              onChange={handleSchemaChange}
              language="json"
              placeholder="Paste JSON Schema here..."
              error={schemaParseError}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Validation Results</label>
          <div className="flex-1 bg-bg-sidebar border border-border-main rounded-xl overflow-auto p-6">
            {parseError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3 text-red-500">
                <AlertCircle className="shrink-0" size={18} />
                <div className="space-y-1">
                  <div className="text-sm font-bold uppercase tracking-tight">Syntax Error</div>
                  <div className="text-xs font-mono break-all">{parseError}</div>
                </div>
              </div>
            )}

            {validationResult && (
              <div className="space-y-6">
                {validationResult.valid ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex gap-3 text-green-500">
                    <CheckCircle2 className="shrink-0" size={18} />
                    <div className="space-y-1">
                      <div className="text-sm font-bold uppercase tracking-tight">Success</div>
                      <div className="text-xs">The JSON data is valid according to the schema.</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3 text-red-500">
                      <AlertCircle className="shrink-0" size={18} />
                      <div className="space-y-1">
                        <div className="text-sm font-bold uppercase tracking-tight">Validation Failed</div>
                        <div className="text-xs space-y-1">
                          Found {validationResult.errors?.length} error(s).
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       {validationResult.errors?.map((err, i) => (
                         <div key={i} className="bg-bg-header border border-border-main rounded-lg p-4 font-mono">
                            <div className="flex items-center justify-between mb-2">
                               <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase font-bold">Error {i + 1}</span>
                               <span className="text-[10px] text-text-secondary">{err.instancePath || 'root'}</span>
                            </div>
                            <div className="text-sm text-white mb-1">{err.message}</div>
                            {err.params && (
                              <div className="text-[10px] text-text-secondary mt-2 pt-2 border-t border-border-subtle">
                                 Params: {JSON.stringify(err.params)}
                              </div>
                            )}
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!parseError && !validationResult && (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-30 gap-3 text-center">
                <ShieldCheck size={48} />
                <div className="text-sm">Ready to validate</div>
                <div className="text-[10px] max-w-[200px]">Click the validate button to check your JSON against the schema</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

import { ShieldCheck } from 'lucide-react';
