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
  RefreshCw,
  Lock,
  Key,
  User,
  Copy,
  CheckCircle
} from 'lucide-react';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

const parseParamsFromUrl = (urlStr: string): QueryParam[] => {
  try {
    if (!urlStr) return [];
    
    const queryIdx = urlStr.indexOf('?');
    if (queryIdx === -1) return [];
    
    const queryString = urlStr.substring(queryIdx + 1);
    const searchParams = new URLSearchParams(queryString);
    const params: QueryParam[] = [];
    
    searchParams.forEach((value, key) => {
      params.push({ key, value, enabled: true });
    });
    
    return params;
  } catch (e) {
    console.error('Failed to parse params from URL', e);
    return [];
  }
};

const generateUrlWithParams = (baseUrl: string, params: QueryParam[]): string => {
  try {
    const queryIdx = baseUrl.indexOf('?');
    const cleanBase = queryIdx > -1 ? baseUrl.substring(0, queryIdx) : baseUrl;
    
    const searchParams = new URLSearchParams();
    params.forEach(p => {
      if (p.enabled && p.key) {
        searchParams.append(p.key, p.value);
      }
    });
    
    const searchStr = searchParams.toString();
    return searchStr ? `${cleanBase}?${searchStr}` : cleanBase;
  } catch (e) {
    return baseUrl;
  }
};

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  headers: Header[];
  body: string;
  authType: 'none' | 'basic' | 'bearer' | 'apikey';
  basicUser: string;
  basicPass: string;
  bearerToken: string;
  apiKeyName: string;
  apiKeyValue: string;
  timeoutSec?: number;
  timestamp: number;
}

export default function RestApiManager() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  const [body, setBody] = useState('');
  const [timeoutSec, setTimeoutSec] = useState<number>(30);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('headers');
  const [authType, setAuthType] = useState<'none' | 'basic' | 'bearer' | 'apikey'>('none');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [apiKeyName, setApiKeyName] = useState('X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [curlInput, setCurlInput] = useState('');
  const [showCurlModal, setShowCurlModal] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const bodyError = useMemo(() => {
    if (!body.trim()) return null;
    try {
      JSON.parse(body);
      return null;
    } catch (e: any) {
      return e.message || 'Malformed JSON';
    }
  }, [body]);

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

  const addQueryParam = () => {
    const newParams = [...queryParams, { key: '', value: '', enabled: true }];
    updateQueryParamsAndUrl(newParams);
  };

  const removeQueryParam = (index: number) => {
    const newParams = queryParams.filter((_, i) => i !== index);
    updateQueryParamsAndUrl(newParams);
  };

  const updateQueryParam = (index: number, field: keyof QueryParam, value: any) => {
    const newParams = [...queryParams];
    newParams[index] = { ...newParams[index], [field]: value };
    updateQueryParamsAndUrl(newParams);
  };

  const updateQueryParamsAndUrl = (newParams: QueryParam[]) => {
    setQueryParams(newParams);
    const newUrl = generateUrlWithParams(url, newParams);
    setUrl(newUrl);
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

    const controller = new AbortController();
    const timeoutId = timeoutSec > 0 
      ? setTimeout(() => controller.abort(), timeoutSec * 1000) 
      : null;

    try {
      const activeHeaders = headers
        .filter(h => h.enabled && h.key)
        .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {} as Record<string, string>);

      // Add Authentication Headers
      if (authType === 'basic' && basicUser && basicPass) {
        const credentials = btoa(`${basicUser}:${basicPass}`);
        activeHeaders['Authorization'] = `Basic ${credentials}`;
      } else if (authType === 'bearer' && bearerToken) {
        activeHeaders['Authorization'] = `Bearer ${bearerToken}`;
      } else if (authType === 'apikey' && apiKeyName && apiKeyValue) {
        activeHeaders[apiKeyName] = apiKeyValue;
      }

      const fetchOptions: RequestInit = {
        method,
        headers: activeHeaders,
        signal: controller.signal
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
          authType,
          basicUser,
          basicPass,
          bearerToken,
          apiKeyName,
          apiKeyValue,
          timeoutSec,
          timestamp: Date.now() 
        },
        ...prev.filter(h => h.url !== url || h.method !== method).slice(0, 19)
      ]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError(`Request timed out after ${timeoutSec} seconds`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to send request');
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
      setResponseTime(Math.round(performance.now() - start));
    }
  };

  const importCurl = () => {
    if (!curlInput.trim()) return;

    try {
      // Clean up the input (remove backslashes at end of lines and extra spaces)
      const cleanInput = curlInput.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();

      // Extract Method
      let extractedMethod = 'GET';
      const methodMatch = cleanInput.match(/-X\s+([A-Z]+)/i) || cleanInput.match(/--request\s+([A-Z]+)/i);
      if (methodMatch) {
        extractedMethod = methodMatch[1].toUpperCase();
      }

      // Extract URL
      // Look for something that looks like http or https, optionally quoted
      const urlMatches = cleanInput.match(/(?:['"]?)(https?:\/\/[^\s'"]+)(?:['"]?)/i);
      let foundUrl = '';
      if (urlMatches && urlMatches[1]) {
        foundUrl = urlMatches[1];
      } else {
        // Fallback: search for first token that doesn't start with - and isn't curl
        const tokens = cleanInput.split(' ');
        for (let i = 1; i < tokens.length; i++) {
          if (!tokens[i].startsWith('-') && !tokens[i-1].startsWith('-')) {
            if (tokens[i].includes('.') || tokens[i].includes('localhost')) {
              foundUrl = tokens[i].replace(/['"]/g, '');
              break;
            }
          }
        }
      }

      if (foundUrl) {
        setUrl(foundUrl);
        setQueryParams(parseParamsFromUrl(foundUrl));
      }

      // Extract Headers
      // Handle -H 'Key: Value' or -H "Key: Value" or --header 'Key: Value'
      const headerRegex = /(?:-H|--header)\s+(['"])(.*?)\1/g;
      const newHeaders: Header[] = [];
      let match;
      while ((match = headerRegex.exec(cleanInput)) !== null) {
        const headerStr = match[2];
        const colonIndex = headerStr.indexOf(':');
        if (colonIndex > -1) {
          const key = headerStr.slice(0, colonIndex).trim();
          const value = headerStr.slice(colonIndex + 1).trim();
          if (key) {
            newHeaders.push({ key, value, enabled: true });
          }
        }
      }
      
      // Fallback for unquoted headers like -H Key:Value
      if (newHeaders.length === 0) {
        const simpleHeaderRegex = /(?:-H|--header)\s+([^\s'"]+)/g;
        while ((match = simpleHeaderRegex.exec(cleanInput)) !== null) {
          const headerStr = match[1];
          const colonIndex = headerStr.indexOf(':');
          if (colonIndex > -1) {
            const key = headerStr.slice(0, colonIndex).trim();
            const value = headerStr.slice(colonIndex + 1).trim();
            if (key) {
              newHeaders.push({ key, value, enabled: true });
            }
          }
        }
      }

      if (newHeaders.length > 0) {
        setHeaders(newHeaders);
      }

      // Extract Body
      // Handle -d, --data, --data-raw, --data-binary
      const bodyRegex = /(?:-d|--data(?:-raw|-binary)?)\s+(['"])(.*?)\1/g;
      const bodyParts: string[] = [];
      while ((match = bodyRegex.exec(cleanInput)) !== null) {
        bodyParts.push(match[2]);
      }
      
      if (bodyParts.length > 0) {
        setBody(bodyParts.join('&'));
        if (extractedMethod === 'GET') {
          extractedMethod = 'POST';
        }
      } else {
        // Try unquoted data if any
        const simpleBodyRegex = /(?:-d|--data(?:-raw|-binary)?)\s+([^\s'"]+)/;
        const simpleBodyMatch = cleanInput.match(simpleBodyRegex);
        if (simpleBodyMatch && simpleBodyMatch[1]) {
          setBody(simpleBodyMatch[1]);
          if (extractedMethod === 'GET') {
            extractedMethod = 'POST';
          }
        }
      }

      setMethod(extractedMethod);
      setShowCurlModal(false);
      setCurlInput('');
      setError(null);
    } catch (e) {
      setError('Failed to parse cURL command. Ensure it follows standard cURL syntax.');
    }
  };

  const getCurlCommand = useMemo(() => {
    let cmd = `curl -X ${method} '${url}'`;
    
    // Auth headers for cURL
    if (authType === 'basic' && basicUser && basicPass) {
      const credentials = btoa(`${basicUser}:${basicPass}`);
      cmd += ` \\\n  -H 'Authorization: Basic ${credentials}'`;
    } else if (authType === 'bearer' && bearerToken) {
      cmd += ` \\\n  -H 'Authorization: Bearer ${bearerToken}'`;
    } else if (authType === 'apikey' && apiKeyName && apiKeyValue) {
      cmd += ` \\\n  -H '${apiKeyName}: ${apiKeyValue}'`;
    }

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
        setQueryParams([]);
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
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
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
                onChange={(e) => {
                  const newUrl = e.target.value;
                  setUrl(newUrl);
                  setQueryParams(parseParamsFromUrl(newUrl));
                }}
                placeholder="https://api.example.com/v1/resource"
                className="w-full bg-bg-header border border-border-main rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-brand transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
              />
            </div>
            <div className="flex items-center gap-2 bg-bg-header border border-border-main rounded-xl px-4 py-3 shrink-0" title="Request Timeout (seconds)">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Timeout</span>
              <input
                type="number"
                min="1"
                max="300"
                value={timeoutSec || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTimeoutSec(isNaN(val) ? 0 : Math.max(1, Math.min(300, val)));
                }}
                placeholder="30"
                className="w-10 bg-transparent border-none text-sm text-white font-mono outline-none text-center p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] text-text-secondary select-none font-bold uppercase">s</span>
            </div>
          </div>
          <button
            onClick={sendRequest}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-brand hover:bg-brand/90 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand/20 active:scale-95 cursor-pointer"
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
                onClick={() => setActiveTab('params')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'params' ? 'text-brand' : 'text-text-secondary hover:text-white'}`}
              >
                Params
                {activeTab === 'params' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
              </button>
              <button 
                onClick={() => setActiveTab('headers')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'headers' ? 'text-brand' : 'text-text-secondary hover:text-white'}`}
              >
                Headers
                {activeTab === 'headers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
              </button>
              <button 
                onClick={() => setActiveTab('auth')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'auth' ? 'text-brand' : 'text-text-secondary hover:text-white'}`}
              >
                Auth
                {activeTab === 'auth' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
              </button>
              <button 
                onClick={() => setActiveTab('body')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors relative flex items-center gap-1.5 ${activeTab === 'body' ? 'text-brand' : 'text-text-secondary hover:text-white'}`}
              >
                <span>Body</span>
                {bodyError && (
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" title="JSON is malformed" />
                )}
                {activeTab === 'body' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'params' ? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-[30px_1fr_1.2fr_30px] gap-2 px-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    <div></div>
                    <div>Key</div>
                    <div>Value</div>
                    <div></div>
                  </div>
                  {queryParams.map((param, index) => (
                    <div key={index} className="grid grid-cols-[30px_1fr_1.2fr_30px] gap-2 items-center group">
                      <input 
                        type="checkbox" 
                        checked={param.enabled} 
                        onChange={(e) => updateQueryParam(index, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded border-border-main bg-bg-header text-brand focus:ring-brand cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={param.key} 
                        onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                        placeholder="Param Key"
                        className="bg-bg-header border border-border-main rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand/40"
                      />
                      <input 
                        type="text" 
                        value={param.value} 
                        onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="bg-bg-header border border-border-main rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand/40"
                      />
                      <button 
                        onClick={() => removeQueryParam(index)}
                        className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addQueryParam}
                    className="flex items-center gap-2 text-brand text-xs font-bold mt-2 hover:underline ml-10 cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Parameter
                  </button>
                </div>
              ) : activeTab === 'headers' ? (
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
              ) : activeTab === 'auth' ? (
                <div className="flex flex-col gap-6 p-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Auth Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'none', name: 'No Auth', icon: Lock },
                        { id: 'basic', name: 'Basic', icon: User },
                        { id: 'bearer', name: 'Bearer', icon: Key },
                        { id: 'apikey', name: 'API Key', icon: Settings2 }
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setAuthType(type.id as any)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            authType === type.id 
                              ? 'bg-brand/10 border-brand text-brand' 
                              : 'bg-bg-header border-border-main text-text-secondary hover:border-border-subtle hover:text-white'
                          }`}
                        >
                          <type.icon size={16} />
                          <span className="text-[10px] font-bold uppercase">{type.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {authType === 'basic' && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Username</label>
                        <input 
                          type="text" 
                          value={basicUser}
                          onChange={(e) => setBasicUser(e.target.value)}
                          placeholder="Username"
                          className="w-full bg-bg-header border border-border-main rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-brand transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Password</label>
                        <input 
                          type="password" 
                          value={basicPass}
                          onChange={(e) => setBasicPass(e.target.value)}
                          placeholder="Password"
                          className="w-full bg-bg-header border border-border-main rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-brand transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {authType === 'bearer' && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Token</label>
                      <textarea 
                        value={bearerToken}
                        onChange={(e) => setBearerToken(e.target.value)}
                        placeholder="Bearer Token"
                        className="w-full h-32 bg-bg-header border border-border-main rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand transition-colors resize-none font-mono"
                      />
                    </div>
                  )}

                  {authType === 'apikey' && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Key Name</label>
                        <input 
                          type="text" 
                          value={apiKeyName}
                          onChange={(e) => setApiKeyName(e.target.value)}
                          placeholder="X-API-Key"
                          className="w-full bg-bg-header border border-border-main rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-brand transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Value</label>
                        <input 
                          type="text" 
                          value={apiKeyValue}
                          onChange={(e) => setApiKeyValue(e.target.value)}
                          placeholder="API Key Value"
                          className="w-full bg-bg-header border border-border-main rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-brand transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {authType === 'none' && (
                    <div className="py-12 flex flex-col items-center justify-center text-text-secondary opacity-50">
                      <Lock size={32} className="mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No authentication required</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col gap-2">
                  <div className="flex-1 min-h-[250px] relative">
                    <CodeEditor 
                      value={body}
                      onChange={setBody}
                      language="json"
                      placeholder='{ "key": "value" }'
                    />
                  </div>
                  {bodyError && (
                    <div className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                      <span className="truncate"><strong>JSON Validation Error:</strong> {bodyError}</span>
                    </div>
                  )}
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
                         setQueryParams(parseParamsFromUrl(item.url));
                         setMethod(item.method);
                         setHeaders(item.headers);
                         setBody(item.body);
                         setAuthType(item.authType || 'none');
                         setBasicUser(item.basicUser || '');
                         setBasicPass(item.basicPass || '');
                         setBearerToken(item.bearerToken || '');
                         setApiKeyName(item.apiKeyName || 'X-API-Key');
                         setApiKeyValue(item.apiKeyValue || '');
                         setTimeoutSec(item.timeoutSec !== undefined ? item.timeoutSec : 30);
                         // Switch to appropriate tab based on content
                         if (item.body) setActiveTab('body');
                         else if (item.authType && item.authType !== 'none') setActiveTab('auth');
                         else setActiveTab('headers');
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
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-[10px] text-text-secondary font-mono px-2 py-0.5 bg-bg-app rounded border border-border-main">
                    {typeof response.data === 'string' ? 'Text' : 'JSON'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getCurlCommand);
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 2000);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all border cursor-pointer ${
                      copiedCurl
                        ? 'bg-green-500/10 border-green-500/50 text-green-400'
                        : 'bg-bg-app border-border-main hover:bg-neutral-800 text-text-secondary hover:text-text-main'
                    }`}
                    title="Copy request as cURL command"
                  >
                    {copiedCurl ? <CheckCircle size={12} /> : <Terminal size={12} />}
                    <span className="text-[11px] font-medium">{copiedCurl ? 'Copied cURL!' : 'Copy as cURL'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const responseText = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data;
                      navigator.clipboard.writeText(responseText);
                      setCopiedResponse(true);
                      setTimeout(() => setCopiedResponse(false), 2000);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all border cursor-pointer ${
                      copiedResponse
                        ? 'bg-green-500/10 border-green-500/50 text-green-400'
                        : 'bg-bg-app border-border-main hover:bg-neutral-800 text-text-secondary hover:text-text-main'
                    }`}
                    title="Copy response body"
                  >
                    {copiedResponse ? <CheckCircle size={12} /> : <Copy size={12} />}
                    <span className="text-[11px] font-medium">{copiedResponse ? 'Copied!' : 'Copy Response'}</span>
                  </button>
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
