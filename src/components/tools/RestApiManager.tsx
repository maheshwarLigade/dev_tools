import React, { useState, useCallback, useMemo } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { 
  Send, 
  Trash2, 
  Plus, 
  Terminal, 
  Clock, 
  Database, 
  History,
  FileCode,
  Globe,
  Settings2,
  X,
  RefreshCw
} from 'lucide-react';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  headers: Header[];
  body: string;
  timestamp: number;
}

export default function RestApiManager() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('headers');
  const [curlInput, setCurlInput] = useState('');
  const [showCurlModal, setShowCurlModal] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);

  // Load history from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('devtools-rest-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load REST history', e);
      }
    }
  }, []);

  // Save history to localStorage
  React.useEffect(() => {
    localStorage.setItem('devtools-rest-history', JSON.stringify(history));
  }, [history]);

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: keyof Header, value: any) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const sendRequest = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    const start = performance.now();

    try {
      const activeHeaders = headers
        .filter(h => h.enabled && h.key)
        .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

      const fetchOptions: RequestInit = {
        method,
        headers: activeHeaders,
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body) {
        fetchOptions.body = body;
      }

      const res = await fetch(url.startsWith('http') ? url : `https://${url}`, fetchOptions);
      const data = await res.json().catch(() => null) || await res.text();
      
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        headers: resHeaders,
        ok: res.ok
      });

      setHistory(prev => [
        { 
          id: Math.random().toString(36).substr(2, 9), 
          method, 
          url, 
          headers: [...headers],
          body,
          timestamp: Date.now() 
        },
        ...prev.filter(h => h.url !== url || h.method !== method).slice(0, 19)
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setLoading(false);
      setResponseTime(Math.round(performance.now() - start));
    }
  };

  const importCurl = () => {
    if (!curlInput.trim()) return;

    try {
      // Very basic cURL parser
      const methodMatch = curlInput.match(/-X\s+(\w+)/i) || curlInput.match(/--request\s+(\w+)/i);
      const urlMatch = curlInput.match(/'(https?:\/\/[^']+)'/) || curlInput.match(/"(https?:\/\/[^"]+)"/) || curlInput.match(/(https?:\/\/\b[^\s]+)/);
      
      if (urlMatch) setUrl(urlMatch[1]);
      if (methodMatch) setMethod(methodMatch[1].toUpperCase());
      
      // Extract headers
      const headerRegex = /-H\s+'([^']+)'|-H\s+"([^"]+)"|--header\s+'([^']+)'|--header\s+"([^"]+)"/g;
      const newHeaders: Header[] = [];
      let match;
      while ((match = headerRegex.exec(curlInput)) !== null) {
        const headerStr = match[1] || match[2] || match[3] || match[4];
        if (headerStr) {
          const [key, ...valParts] = headerStr.split(':');
          if (key) {
            newHeaders.push({ key: key.trim(), value: valParts.join(':').trim(), enabled: true });
          }
        }
      }
      if (newHeaders.length > 0) setHeaders(newHeaders);

      // Extract body
      const bodyMatch = curlInput.match(/-d\s+'([^']+)'|-d\s+"([^"]+)"|--data\s+'([^']+)'|--data\s+"([^"]+)"/);
      if (bodyMatch) {
        setBody(bodyMatch[1] || bodyMatch[2] || bodyMatch[3] || bodyMatch[4]);
        if (!methodMatch) setMethod('POST');
      }

      setShowCurlModal(false);
      setCurlInput('');
    } catch (e) {
      setError('Failed to parse cURL command');
    }
  };

  const getCurlCommand = useMemo(() => {
    let cmd = `curl -X ${method} '${url}'`;
    headers.filter(h => h.enabled && h.key).forEach(h => {
      cmd += ` \\\n  -H '${h.key}: ${h.value}'`;
    });
    if (body) {
      cmd += ` \\\n  -d '${body}'`;
    }
    return cmd;
  }, [method, url, headers, body]);

  return (
    <ToolLayout
      title="REST API Manager"
      description="Advanced API testing tool. Build requests with custom methods, headers, and bodies."
      onClear={() => {
        setUrl('');
        setResponse(null);
        setError(null);
        setBody('');
      }}
      actions={
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCurlModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
          >
            <Terminal size={12} />
            <span>Import cURL</span>
          </button>
          <CopyButton text={getCurlCommand} />
        </div>
      }
    >
      <div className="flex flex-col gap-6 h-full">
        {/* Request Bar */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="bg-bg-header border border-border-main rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand transition-colors"
            >
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <Globe size={16} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/resource"
                className="w-full bg-bg-header border border-border-main rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-brand transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
              />
            </div>
          </div>
          <button
            onClick={sendRequest}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-brand hover:bg-brand/90 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
            <span>{loading ? 'Sending...' : 'Send Request'}</span>
          </button>
        </div>

        {/* Request Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex border-b border-border-main">
              <button 
                onClick={() => setActiveTab('headers')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'headers' ? 'text-brand' : 'text-text-secondary hover:text-white'}`}
              >
                Headers
                {activeTab === 'headers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
              </button>
              <button 
                onClick={() => setActiveTab('body')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'body' ? 'text-brand' : 'text-text-secondary hover:text-white'}`}
              >
                Body
                {activeTab === 'body' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'headers' ? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-[30px_1fr_1.2fr_30px] gap-2 px-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    <div></div>
                    <div>Key</div>
                    <div>Value</div>
                    <div></div>
                  </div>
                  {headers.map((header, index) => (
                    <div key={index} className="grid grid-cols-[30px_1fr_1.2fr_30px] gap-2 items-center group">
                      <input 
                        type="checkbox" 
                        checked={header.enabled} 
                        onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded border-border-main bg-bg-header text-brand focus:ring-brand"
                      />
                      <input 
                        type="text" 
                        value={header.key} 
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="Header Key"
                        className="bg-bg-header border border-border-main rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand/40"
                      />
                      <input 
                        type="text" 
                        value={header.value} 
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="bg-bg-header border border-border-main rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand/40"
                      />
                      <button 
                        onClick={() => removeHeader(index)}
                        className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addHeader}
                    className="flex items-center gap-2 text-brand text-xs font-bold mt-2 hover:underline ml-10"
                  >
                    <Plus size={14} />
                    Add Header
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <CodeEditor 
                    value={body}
                    onChange={setBody}
                    language="json"
                    placeholder='{ "key": "value" }'
                  />
                </div>
              )}
            </div>

            {/* History segment */}
            {history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-main">
                <div className="flex items-center justify-between mb-3 pl-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                    <History size={12} />
                    <span>Recent Requests</span>
                  </div>
                  <button 
                    onClick={() => setHistory([])}
                    className="text-[10px] text-text-secondary hover:text-red-500 transition-colors uppercase font-bold"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { 
                        setUrl(item.url); 
                        setMethod(item.method);
                        setHeaders(item.headers);
                        setBody(item.body);
                      }}
                      className="flex items-center justify-between px-3 py-2 bg-bg-header/50 hover:bg-neutral-800 rounded-lg text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[50px] text-center ${
                          item.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                          item.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                          item.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                          item.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {item.method}
                        </span>
                        <span className="text-xs text-text-secondary truncate max-w-[180px]">{item.url}</span>
                      </div>
                      <span className="text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Response Viewer */}
          <div className="flex flex-col gap-4 min-h-0 bg-bg-app rounded-2xl border border-border-main overflow-hidden shadow-inner">
            <div className="px-4 py-3 bg-bg-header/50 border-b border-border-main flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Response</span>
                {response && (
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${response.ok ? 'text-green-500' : 'text-red-500'}`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-text-secondary font-mono">
                      <Clock size={10} />
                      {responseTime}ms
                    </span>
                  </div>
                )}
              </div>
              {response && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-secondary font-mono px-2 py-0.5 bg-bg-app rounded border border-border-main">
                    {typeof response.data === 'string' ? 'Text' : 'JSON'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden relative">
              {!response && !error && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-bg-header flex items-center justify-center mb-4 text-brand">
                    <Database size={32} />
                  </div>
                  <h4 className="text-sm font-semibold mb-2">Ready to send request</h4>
                  <p className="text-xs max-w-[200px]">Enter a URL and send your first request to see the response here.</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-app/50 backdrop-blur-sm z-10">
                  <RefreshCw className="animate-spin text-brand mb-4" size={32} />
                  <span className="text-xs font-medium text-text-secondary">Waiting for response...</span>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 mb-4">
                    <History size={32} />
                  </div>
                  <h4 className="text-sm font-bold text-red-500 mb-2">Request Failed</h4>
                  <p className="text-xs text-text-secondary bg-red-500/5 px-4 py-2 rounded-lg border border-red-500/10">{error}</p>
                  <p className="text-[10px] text-text-secondary mt-4 max-w-[240px]">This might be due to CORS restrictions. Ensure the API supports requests from this domain or try a local API endpoint.</p>
                </div>
              )}

              {response && (
                <div className="h-full flex flex-col">
                  <CodeEditor 
                    value={typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}
                    onChange={() => {}}
                    language={typeof response.data === 'object' ? 'json' : 'text'}
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* cURL Import Modal */}
      {showCurlModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCurlModal(false)}
          />
          <div className="relative w-full max-w-2xl bg-bg-editor border border-border-main rounded-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-main">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                  <Terminal size={18} />
                </div>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Import cURL Command</h3>
              </div>
              <button 
                onClick={() => setShowCurlModal(false)}
                className="text-text-secondary hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">cURL Command</label>
              <textarea
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                placeholder={`curl -X POST 'https://api.example.com' -H 'Content-Type: application/json' -d '{"foo": "bar"}'`}
                className="w-full h-48 bg-bg-app border border-border-main rounded-xl p-4 text-xs font-mono text-white outline-none focus:border-brand transition-colors resize-none"
              />
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setShowCurlModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={importCurl}
                  className="px-6 py-2 bg-brand text-white rounded-lg text-xs font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
