import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { jwtDecode } from 'jwt-decode';

export default function JwtDebugger() {
  const [token, setToken] = useState('');
  const [payload, setPayload] = useState<any>(null);
  const [header, setHeader] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const decode = (val: string) => {
    setToken(val);
    if (!val.trim()) {
      setPayload(null);
      setHeader(null);
      setError(null);
      return;
    }

    try {
      const decodedPayload = jwtDecode(val);
      const decodedHeader = jwtDecode(val, { header: true });
      setPayload(decodedPayload);
      setHeader(decodedHeader);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setPayload(null);
      setHeader(null);
    }
  };

  return (
    <ToolLayout 
      title="JWT Debugger" 
      description="Decode and inspect JSON Web Tokens safely in your browser."
      onClear={() => decode('')}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <label className="text-xs font-semibold text-slate-500 uppercase">Encoded Token</label>
          <div className="flex-1 min-h-[200px]">
            <CodeEditor
              value={token}
              onChange={decode}
              language="text"
              placeholder="Paste your JWT here..."
              error={error}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 min-h-0 overflow-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-pink-500 uppercase">Header</label>
              {header && <CopyButton text={JSON.stringify(header, null, 2)} />}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm">
              <pre className="text-pink-400">{header ? JSON.stringify(header, null, 2) : 'No header decoded'}</pre>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-500 uppercase">Payload</label>
              {payload && <CopyButton text={JSON.stringify(payload, null, 2)} />}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm">
              <pre className="text-purple-400">{payload ? JSON.stringify(payload, null, 2) : 'No payload decoded'}</pre>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
