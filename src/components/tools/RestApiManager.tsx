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
  CheckCircle,
  Search,
  GitCompare,
  BarChart2,
  Activity,
  TrendingUp,
  Zap,
  Percent
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { evaluateJsonPath } from '../../utils/jsonpath';
import { computeSideBySideDiff } from '../../utils/diff';

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
  responseTime?: number;
  responseSize?: number;
  statusCode?: number;
  statusText?: string;
  error?: string;
}

interface EnvVariable {
  key: string;
  value: string;
  enabled: boolean;
}

interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900/95 border border-border-main p-3 rounded-xl shadow-xl font-sans text-xs flex flex-col gap-1.5 max-w-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
            data.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
            data.method === 'POST' ? 'bg-green-500/20 text-green-400' :
            data.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
            data.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
            'bg-purple-500/20 text-purple-400'
          }`}>
            {data.method}
          </span>
          <span className={`text-[10px] font-bold ${data.status >= 200 && data.status < 300 ? 'text-green-400' : 'text-red-400'}`}>
            {data.status === 0 ? 'Failed' : data.status}
          </span>
        </div>
        <p className="text-text-secondary truncate font-mono text-[10px]">{data.url}</p>
        <div className="flex items-center justify-between border-t border-border-subtle/50 pt-1.5 mt-0.5">
          <span className="text-text-secondary text-[10px]">Value:</span>
          <span className="font-bold text-white font-mono">
            {payload[0].value} {payload[0].unit || ''}
          </span>
        </div>
        {data.time && (
          <p className="text-[9px] text-text-secondary text-right mt-0.5">{data.time}</p>
        )}
      </div>
    );
  }
  return null;
};

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
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'mock'>('headers');
  const [isMockEnabled, setIsMockEnabled] = useState(false);
  const [mockStatus, setMockStatus] = useState<number>(200);
  const [mockResponseBody, setMockResponseBody] = useState<string>('{\n  "status": "success",\n  "message": "This is a mock response payload"\n}');
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
  const [jsonPathQuery, setJsonPathQuery] = useState('');

  // Diff viewer states
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');

  const historyWithBodies = useMemo(() => {
    return history.filter(h => h.body && h.body.trim());
  }, [history]);

  const lastSentBody = useMemo(() => {
    if (selectedHistoryId) {
      const match = historyWithBodies.find(h => h.id === selectedHistoryId);
      if (match) return match.body;
    }
    return historyWithBodies[0]?.body || '';
  }, [historyWithBodies, selectedHistoryId]);

  // Set selectedHistoryId to first item when opening modal or when history loads
  React.useEffect(() => {
    if (showDiffModal && !selectedHistoryId && historyWithBodies.length > 0) {
      setSelectedHistoryId(historyWithBodies[0].id);
    }
  }, [showDiffModal, historyWithBodies, selectedHistoryId]);

  const diffResult = useMemo(() => {
    return computeSideBySideDiff(lastSentBody, body);
  }, [lastSentBody, body]);

  const [showDashboardModal, setShowDashboardModal] = useState(false);

  const dashboardMetrics = useMemo(() => {
    if (history.length === 0) {
      return {
        totalRequests: 0,
        avgLatency: 0,
        maxLatency: 0,
        avgSize: 0,
        totalSize: 0,
        successRate: 0,
        latencyTimeline: [],
        sizeTimeline: [],
        statusDistribution: [],
        recentLogs: []
      };
    }

    const totalRequests = history.length;
    let latencySum = 0;
    let maxLatency = 0;
    let sizeSum = 0;
    let successCount = 0;

    const statusCounts: Record<string, number> = {};

    history.forEach(h => {
      const responseTime = h.responseTime ?? 0;
      const responseSize = h.responseSize ?? 0;
      const status = h.statusCode !== undefined ? h.statusCode : 200;

      latencySum += responseTime;
      if (responseTime > maxLatency) {
        maxLatency = responseTime;
      }

      sizeSum += responseSize;

      if (status >= 200 && status < 300) {
        successCount++;
      }

      let statusGroup = 'Other';
      if (status === 0) {
        statusGroup = 'Failed';
      } else if (status >= 200 && status < 300) {
        statusGroup = '2xx Success';
      } else if (status >= 300 && status < 400) {
        statusGroup = '3xx Redirect';
      } else if (status >= 400 && status < 500) {
        statusGroup = '4xx Client Error';
      } else if (status >= 500) {
        statusGroup = '5xx Server Error';
      }
      statusCounts[statusGroup] = (statusCounts[statusGroup] || 0) + 1;
    });

    const avgLatency = Math.round(latencySum / totalRequests);
    const avgSize = Number((sizeSum / totalRequests).toFixed(2));
    const totalSize = Number(sizeSum.toFixed(2));
    const successRate = Math.round((successCount / totalRequests) * 100);

    const cronHistory = [...history].reverse();
    
    const latencyTimeline = cronHistory.map((h, i) => {
      const dateStr = new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        index: i + 1,
        name: `#${i + 1}`,
        time: dateStr,
        latency: h.responseTime ?? 0,
        method: h.method,
        url: h.url.length > 25 ? h.url.substring(0, 25) + '...' : h.url,
        status: h.statusCode !== undefined ? h.statusCode : 200,
      };
    });

    const sizeTimeline = cronHistory.map((h, i) => {
      const dateStr = new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        index: i + 1,
        name: `#${i + 1}`,
        time: dateStr,
        size: h.responseSize ?? 0,
        method: h.method,
        url: h.url.length > 25 ? h.url.substring(0, 25) + '...' : h.url,
        status: h.statusCode !== undefined ? h.statusCode : 200,
      };
    });

    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));

    return {
      totalRequests,
      avgLatency,
      maxLatency,
      avgSize,
      totalSize,
      successRate,
      latencyTimeline,
      sizeTimeline,
      statusDistribution,
      recentLogs: history.slice(0, 10)
    };
  }, [history]);

  // Environment and Global Variables States
  const [environments, setEnvironments] = useState<Environment[]>([
    {
      id: 'default',
      name: 'Global Environment',
      variables: [
        { key: 'baseUrl', value: 'https://api.github.com', enabled: true },
        { key: 'token', value: 'your_token_here', enabled: true }
      ]
    }
  ]);
  const [activeEnvId, setActiveEnvId] = useState<string>('none');
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [selectedEnvForEditId, setSelectedEnvForEditId] = useState<string>('default');

  const activeVariables = useMemo(() => {
    if (activeEnvId === 'none') return [];
    const env = environments.find(e => e.id === activeEnvId);
    return env ? env.variables : [];
  }, [environments, activeEnvId]);

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const resolveStr = useCallback((str: string): string => {
    if (!str || activeEnvId === 'none') return str;
    let resolved = str;
    activeVariables.forEach(v => {
      if (v.enabled && v.key.trim()) {
        const regex = new RegExp(`\\{\\{\\s*${escapeRegExp(v.key.trim())}\\s*\\}\\}`, 'g');
        resolved = resolved.replace(regex, v.value);
      }
    });
    return resolved;
  }, [activeEnvId, activeVariables]);

  const addEnvironment = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newEnv: Environment = {
      id: newId,
      name: `New Environment ${environments.length + 1}`,
      variables: [{ key: '', value: '', enabled: true }]
    };
    setEnvironments([...environments, newEnv]);
    setSelectedEnvForEditId(newId);
  };

  const deleteEnvironment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = environments.filter(env => env.id !== id);
    setEnvironments(filtered);
    if (activeEnvId === id) {
      setActiveEnvId('none');
    }
    if (selectedEnvForEditId === id) {
      setSelectedEnvForEditId(filtered.length > 0 ? filtered[0].id : '');
    }
  };

  const renameEnvironment = (id: string, newName: string) => {
    setEnvironments(environments.map(env => 
      env.id === id ? { ...env, name: newName } : env
    ));
  };

  const addVariable = (envId: string) => {
    setEnvironments(environments.map(env => {
      if (env.id === envId) {
        return {
          ...env,
          variables: [...env.variables, { key: '', value: '', enabled: true }]
        };
      }
      return env;
    }));
  };

  const updateVariable = (envId: string, varIdx: number, field: keyof EnvVariable, value: any) => {
    setEnvironments(environments.map(env => {
      if (env.id === envId) {
        const newVars = [...env.variables];
        newVars[varIdx] = { ...newVars[varIdx], [field]: value };
        return { ...env, variables: newVars };
      }
      return env;
    }));
  };

  const deleteVariable = (envId: string, varIdx: number) => {
    setEnvironments(environments.map(env => {
      if (env.id === envId) {
        return {
          ...env,
          variables: env.variables.filter((_, idx) => idx !== varIdx)
        };
      }
      return env;
    }));
  };

  const selectedEnvForEdit = useMemo(() => {
    return environments.find(env => env.id === selectedEnvForEditId) || environments[0];
  }, [environments, selectedEnvForEditId]);

  const queryResult = useMemo(() => {
    if (!response || typeof response.data !== 'object' || !jsonPathQuery.trim()) {
      return null;
    }
    return evaluateJsonPath(response.data, jsonPathQuery);
  }, [response, jsonPathQuery]);

  const bodyError = useMemo(() => {
    if (!body.trim()) return null;
    try {
      JSON.parse(body);
      return null;
    } catch (e: any) {
      return e.message || 'Malformed JSON';
    }
  }, [body]);

  const mockBodyError = useMemo(() => {
    if (!mockResponseBody.trim()) return null;
    try {
      JSON.parse(mockResponseBody);
      return null;
    } catch (e: any) {
      return e.message || 'Malformed JSON';
    }
  }, [mockResponseBody]);

  // Load history & environments from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('devtools-rest-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load REST history', e);
      }
    }

    const savedEnvs = localStorage.getItem('devtools-rest-environments');
    const savedActiveId = localStorage.getItem('devtools-rest-active-env-id');
    if (savedEnvs) {
      try {
        setEnvironments(JSON.parse(savedEnvs));
      } catch (e) {
        console.error('Failed to load REST environments', e);
      }
    }
    if (savedActiveId) {
      setActiveEnvId(savedActiveId);
    }

    const savedMockEnabled = localStorage.getItem('devtools-rest-mock-enabled');
    if (savedMockEnabled !== null) {
      try {
        setIsMockEnabled(JSON.parse(savedMockEnabled));
      } catch (e) {}
    }

    const savedMockStatus = localStorage.getItem('devtools-rest-mock-status');
    if (savedMockStatus !== null) {
      try {
        setMockStatus(JSON.parse(savedMockStatus));
      } catch (e) {}
    }

    const savedMockResponseBody = localStorage.getItem('devtools-rest-mock-response-body');
    if (savedMockResponseBody !== null) {
      setMockResponseBody(savedMockResponseBody);
    }
  }, []);

  // Save history to localStorage
  React.useEffect(() => {
    localStorage.setItem('devtools-rest-history', JSON.stringify(history));
  }, [history]);

  // Save environments to localStorage
  React.useEffect(() => {
    localStorage.setItem('devtools-rest-environments', JSON.stringify(environments));
  }, [environments]);

  React.useEffect(() => {
    localStorage.setItem('devtools-rest-active-env-id', activeEnvId);
  }, [activeEnvId]);

  React.useEffect(() => {
    localStorage.setItem('devtools-rest-mock-enabled', JSON.stringify(isMockEnabled));
  }, [isMockEnabled]);

  React.useEffect(() => {
    localStorage.setItem('devtools-rest-mock-status', JSON.stringify(mockStatus));
  }, [mockStatus]);

  React.useEffect(() => {
    localStorage.setItem('devtools-rest-mock-response-body', mockResponseBody);
  }, [mockResponseBody]);

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
    setJsonPathQuery('');
    const start = performance.now();

    if (isMockEnabled) {
      // Simulate a small network delay for an authentic experience
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        let parsedData: any;
        try {
          if (mockResponseBody.trim()) {
            parsedData = JSON.parse(mockResponseBody);
          } else {
            parsedData = null;
          }
        } catch (e) {
          parsedData = mockResponseBody; // Fallback to raw string
        }

        const standardStatuses: Record<number, string> = {
          200: 'OK',
          201: 'Created',
          202: 'Accepted',
          204: 'No Content',
          301: 'Moved Permanently',
          302: 'Found',
          400: 'Bad Request',
          401: 'Unauthorized',
          403: 'Forbidden',
          404: 'Not Found',
          405: 'Method Not Allowed',
          500: 'Internal Server Error',
          502: 'Bad Gateway',
          503: 'Service Unavailable'
        };

        const statusText = standardStatuses[mockStatus] || 'Custom Status';

        setResponse({
          status: mockStatus,
          statusText: statusText,
          data: parsedData,
          headers: {
            'content-type': 'application/json',
            'x-mock-response': 'true',
            'date': new Date().toUTCString(),
            'server': 'Mock REST API Manager'
          },
          ok: mockStatus >= 200 && mockStatus < 300
        });

        const sizeInBytes = mockResponseBody ? mockResponseBody.length : 0;
        const responseSizeKB = Number((sizeInBytes / 1024).toFixed(2));
        const duration = Math.round(performance.now() - start);

        setHistory(prev => [
          { 
            id: Math.random().toString(36).substr(2, 9), 
            method: `${method} (MOCK)`, 
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
            timestamp: Date.now(),
            responseTime: duration,
            responseSize: responseSizeKB,
            statusCode: mockStatus,
            statusText: statusText
          },
          ...prev.filter(h => h.url !== url || h.method !== `${method} (MOCK)`).slice(0, 19)
        ]);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Mock response error');
      } finally {
        setLoading(false);
        setResponseTime(Math.round(performance.now() - start));
      }
      return;
    }

    const controller = new AbortController();
    const timeoutId = timeoutSec > 0 
      ? setTimeout(() => controller.abort(), timeoutSec * 1000) 
      : null;

    try {
      const activeHeaders = headers
        .filter(h => h.enabled && h.key)
        .reduce((acc, h) => {
          const resolvedKey = resolveStr(h.key);
          const resolvedValue = resolveStr(h.value);
          return { ...acc, [resolvedKey]: resolvedValue };
        }, {} as Record<string, string>);

      // Add Authentication Headers with substitutions resolved
      if (authType === 'basic' && basicUser && basicPass) {
        const resolvedUser = resolveStr(basicUser);
        const resolvedPass = resolveStr(basicPass);
        const credentials = btoa(`${resolvedUser}:${resolvedPass}`);
        activeHeaders['Authorization'] = `Basic ${credentials}`;
      } else if (authType === 'bearer' && bearerToken) {
        const resolvedToken = resolveStr(bearerToken);
        activeHeaders['Authorization'] = `Bearer ${resolvedToken}`;
      } else if (authType === 'apikey' && apiKeyName && apiKeyValue) {
        const resolvedKeyName = resolveStr(apiKeyName);
        const resolvedKeyValue = resolveStr(apiKeyValue);
        activeHeaders[resolvedKeyName] = resolvedKeyValue;
      }

      const fetchOptions: RequestInit = {
        method,
        headers: activeHeaders,
        signal: controller.signal
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body) {
        fetchOptions.body = resolveStr(body);
      }

      const resolvedUrl = resolveStr(url);
      const res = await fetch(resolvedUrl.startsWith('http') ? resolvedUrl : `https://${resolvedUrl}`, fetchOptions);
      const data = await res.json().catch(() => null) || await res.text();
      
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      let sizeInBytes = 0;
      if (typeof data === 'object' && data !== null) {
        sizeInBytes = JSON.stringify(data).length;
      } else if (typeof data === 'string') {
        sizeInBytes = data.length;
      }
      const responseSizeKB = Number((sizeInBytes / 1024).toFixed(2));
      const duration = Math.round(performance.now() - start);

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
          timestamp: Date.now(),
          responseTime: duration,
          responseSize: responseSizeKB,
          statusCode: res.status,
          statusText: res.statusText
        },
        ...prev.filter(h => h.url !== url || h.method !== method).slice(0, 19)
      ]);
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      if (err.name === 'AbortError') {
        setError(`Request timed out after ${timeoutSec} seconds`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to send request');
      }

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
          timestamp: Date.now(),
          responseTime: duration,
          responseSize: 0,
          statusCode: 0,
          statusText: 'Failed',
          error: err instanceof Error ? err.message : 'Failed to send request'
        },
        ...prev.filter(h => h.url !== url || h.method !== method).slice(0, 19)
      ]);
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
    const resolvedUrl = resolveStr(url);
    const resolvedBody = resolveStr(body);

    let cmd = `curl -X ${method} '${resolvedUrl}'`;
    
    // Auth headers for cURL
    if (authType === 'basic' && basicUser && basicPass) {
      const resolvedUser = resolveStr(basicUser);
      const resolvedPass = resolveStr(basicPass);
      const credentials = btoa(`${resolvedUser}:${resolvedPass}`);
      cmd += ` \\\n  -H 'Authorization: Basic ${credentials}'`;
    } else if (authType === 'bearer' && bearerToken) {
      const resolvedToken = resolveStr(bearerToken);
      cmd += ` \\\n  -H 'Authorization: Bearer ${resolvedToken}'`;
    } else if (authType === 'apikey' && apiKeyName && apiKeyValue) {
      const resolvedKeyName = resolveStr(apiKeyName);
      const resolvedKeyValue = resolveStr(apiKeyValue);
      cmd += ` \\\n  -H '${resolvedKeyName}: ${resolvedKeyValue}'`;
    }

    headers.filter(h => h.enabled && h.key).forEach(h => {
      const resolvedKey = resolveStr(h.key);
      const resolvedValue = resolveStr(h.value);
      cmd += ` \\\n  -H '${resolvedKey}: ${resolvedValue}'`;
    });
    if (body) {
      cmd += ` \\\n  -d '${resolvedBody}'`;
    }
    return cmd;
  }, [method, url, headers, body, resolveStr, authType, basicUser, basicPass, bearerToken, apiKeyName, apiKeyValue]);

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
        setJsonPathQuery('');
      }}
      actions={
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Environment Selector */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-border-subtle rounded-md px-2 py-1 select-none">
            <Globe size={12} className="text-brand shrink-0" />
            <select
              value={activeEnvId}
              onChange={(e) => setActiveEnvId(e.target.value)}
              className="bg-transparent border-none text-[11px] font-bold text-white outline-none focus:ring-0 cursor-pointer py-0 pr-6 pl-1"
            >
              <option value="none" className="bg-neutral-950">No Environment</option>
              {environments.map(env => (
                <option key={env.id} value={env.id} className="bg-neutral-950">{env.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (activeEnvId !== 'none') {
                  setSelectedEnvForEditId(activeEnvId);
                } else if (environments.length > 0) {
                  setSelectedEnvForEditId(environments[0].id);
                }
                setShowEnvModal(true);
              }}
              className="p-1 hover:text-white text-text-secondary rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Manage Environments"
            >
              <Settings2 size={13} />
            </button>
          </div>

          <button 
            onClick={() => setShowCurlModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle cursor-pointer"
          >
            <Terminal size={12} />
            <span>Import cURL</span>
          </button>

          <button 
            onClick={() => setShowDashboardModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle cursor-pointer"
            title="View Performance Analytics"
          >
            <BarChart2 size={12} className="text-brand" />
            <span>Metrics Dashboard</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand/20 text-[9px] text-brand font-bold">
                {history.length}
              </span>
            )}
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
            <div className="flex-1 flex flex-col gap-1">
              <div className="relative">
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
              {url && url.includes('{{') && url.includes('}}') && (
                <div className="text-[10px] text-text-secondary pl-2 flex items-center gap-1.5 animate-in fade-in duration-200">
                  <span className="font-semibold text-brand select-none">Resolved:</span>
                  <span className="font-mono text-neutral-300 break-all">{resolveStr(url)}</span>
                </div>
              )}
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

        {isMockEnabled && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-amber-400">Offline/Mocking Mode is ACTIVE</span>
              <span className="text-[10px] text-neutral-400 hidden sm:inline">- Outgoing requests will be intercepted to return status {mockStatus} immediately.</span>
            </div>
            <button
              onClick={() => setIsMockEnabled(false)}
              className="text-[10px] text-amber-400 hover:text-white font-bold uppercase hover:underline cursor-pointer"
            >
              Disable
            </button>
          </div>
        )}

        {/* Request Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex border-b border-border-main flex-wrap">
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
              <button 
                onClick={() => setActiveTab('mock')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors relative flex items-center gap-1.5 ${activeTab === 'mock' ? 'text-amber-500' : 'text-text-secondary hover:text-white'}`}
              >
                <span>Mocking</span>
                {isMockEnabled && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" title="Mock mode is active" />
                )}
                {activeTab === 'mock' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
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
              ) : activeTab === 'body' ? (
                <div className="h-full flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1 pl-1">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">JSON Payload</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          try {
                            if (!body.trim()) return;
                            const parsed = JSON.parse(body);
                            setBody(JSON.stringify(parsed, null, 2));
                          } catch (e) {
                            // Handled
                          }
                        }}
                        disabled={!!bodyError || !body.trim()}
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:hover:bg-neutral-800 text-text-secondary hover:text-white border border-border-subtle cursor-pointer transition-all active:scale-95"
                        title="Format JSON with indentation"
                      >
                        Pretty Print
                      </button>
                      <button
                        onClick={() => {
                          try {
                            if (!body.trim()) return;
                            const parsed = JSON.parse(body);
                            setBody(JSON.stringify(parsed));
                          } catch (e) {
                            // Handled
                          }
                        }}
                        disabled={!!bodyError || !body.trim()}
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:hover:bg-neutral-800 text-text-secondary hover:text-white border border-border-subtle cursor-pointer transition-all active:scale-95"
                        title="Minify JSON (remove whitespace)"
                      >
                        Minify
                      </button>
                      <button
                        onClick={() => setShowDiffModal(true)}
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-text-secondary hover:text-white border border-border-subtle cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                        title="Compare current body with previously sent requests"
                      >
                        <GitCompare size={11} className="text-brand" />
                        <span>Compare Diff</span>
                      </button>
                    </div>
                  </div>
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
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Toggle Switch Panel */}
                  <div className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isMockEnabled ? 'bg-amber-400 animate-pulse' : 'bg-neutral-600'}`} />
                        Offline / Mocking Mode
                      </span>
                      <span className="text-[10px] text-text-secondary font-semibold leading-relaxed">
                        {isMockEnabled 
                          ? 'Requests to any URL will be intercepted and will immediately return the defined mock payload below.' 
                          : 'Requests will be sent over the actual network to their destination URLs.'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isMockEnabled}
                        onChange={(e) => setIsMockEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-white peer-checked:after:border-white" />
                    </label>
                  </div>

                  {/* Status Code Panel */}
                  <div className="flex flex-col gap-2.5 bg-neutral-900/30 p-4 border border-border-subtle rounded-xl">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Mock HTTP Status Code</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={mockStatus}
                          onChange={(e) => setMockStatus(parseInt(e.target.value) || 200)}
                          className="w-24 bg-bg-app border border-border-main rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-amber-500 transition-colors"
                          placeholder="200"
                        />
                        <span className="text-xs font-semibold text-neutral-400 font-mono">
                          {(() => {
                            const standardStatuses: Record<number, string> = {
                              200: 'OK',
                              201: 'Created',
                              202: 'Accepted',
                              204: 'No Content',
                              301: 'Moved Permanently',
                              302: 'Found',
                              400: 'Bad Request',
                              401: 'Unauthorized',
                              403: 'Forbidden',
                              404: 'Not Found',
                              405: 'Method Not Allowed',
                              500: 'Internal Server Error',
                              502: 'Bad Gateway',
                              503: 'Service Unavailable'
                            };
                            return standardStatuses[mockStatus] || 'Custom Status';
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mr-1">Presets:</span>
                      {[200, 201, 204, 400, 401, 403, 404, 500].map(code => (
                        <button
                          key={code}
                          onClick={() => setMockStatus(code)}
                          className={`text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                            mockStatus === code 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                              : 'bg-neutral-800 hover:bg-neutral-700 text-text-secondary border border-transparent hover:border-border-subtle hover:text-white'
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mock Response Payload Editor */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between pl-1">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Mock Response Body (JSON)</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            try {
                              if (!mockResponseBody.trim()) return;
                              const parsed = JSON.parse(mockResponseBody);
                              setMockResponseBody(JSON.stringify(parsed, null, 2));
                            } catch (e) {}
                          }}
                          disabled={!!mockBodyError || !mockResponseBody.trim()}
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:hover:bg-neutral-800 text-text-secondary hover:text-white border border-border-subtle cursor-pointer transition-all active:scale-95"
                        >
                          Pretty Print
                        </button>
                        <button
                          onClick={() => {
                            try {
                              if (!mockResponseBody.trim()) return;
                              const parsed = JSON.parse(mockResponseBody);
                              setMockResponseBody(JSON.stringify(parsed));
                            } catch (e) {}
                          }}
                          disabled={!!mockBodyError || !mockResponseBody.trim()}
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:hover:bg-neutral-800 text-text-secondary hover:text-white border border-border-subtle cursor-pointer transition-all active:scale-95"
                        >
                          Minify
                        </button>
                        <button
                          onClick={() => {
                            setMockResponseBody('{\n  "status": "success",\n  "message": "This is a mock response payload"\n}');
                          }}
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-text-secondary hover:text-white border border-border-subtle cursor-pointer transition-all active:scale-95"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="min-h-[250px] relative">
                      <CodeEditor
                        value={mockResponseBody}
                        onChange={setMockResponseBody}
                        language="json"
                        placeholder='{ "status": "success" }'
                      />
                    </div>
                    {mockBodyError && (
                      <div className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <span className="truncate"><strong>JSON Validation Error:</strong> {mockBodyError}</span>
                      </div>
                    )}
                  </div>
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

            {response && typeof response.data === 'object' && (
              <div className="px-4 py-2 border-b border-border-main bg-bg-header/20 flex flex-col gap-1 animate-in fade-in duration-200 shrink-0">
                <div className="flex items-center gap-2 w-full">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-widest shrink-0 select-none">
                    <Search size={12} className="text-brand" />
                    <span>JSONPath Filter</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={jsonPathQuery}
                      onChange={(e) => setJsonPathQuery(e.target.value)}
                      placeholder="e.g., $.items[*].name or $.data.id"
                      className="w-full bg-bg-header/50 border border-border-main hover:border-border-subtle focus:border-brand/40 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white outline-none font-mono transition-colors"
                    />
                    {jsonPathQuery && (
                      <button
                        onClick={() => setJsonPathQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors cursor-pointer"
                        title="Clear Filter"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
                {queryResult && !queryResult.success && (
                  <div className="text-[10px] text-red-400 pl-1 font-semibold animate-in fade-in">
                    Error: {queryResult.error}
                  </div>
                )}
                {queryResult && queryResult.success && jsonPathQuery.trim() && (
                  <div className="text-[10px] text-green-400 pl-1 font-semibold animate-in fade-in flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    Filtered results returned successfully.
                  </div>
                )}
              </div>
            )}

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
                    value={
                      queryResult 
                        ? (queryResult.success ? JSON.stringify(queryResult.data, null, 2) : `// JSONPath Query Error:\n// ${queryResult.error}`)
                        : (typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data)
                    }
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

      {/* Environments Management Modal */}
      {showEnvModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEnvModal(false)}
          />
          <div className="relative w-full max-w-4xl h-[600px] bg-bg-editor border border-border-main rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-main shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                  <Globe size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Manage Environments</h3>
                  <p className="text-[10px] text-text-secondary">Define variables and toggle active credentials for substitutions.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEnvModal(false)}
                className="text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content (Split Pane) */}
            <div className="flex-1 flex min-h-0">
              {/* Left Sidebar: Environments List */}
              <div className="w-1/3 border-r border-border-main bg-neutral-900/40 flex flex-col p-4 gap-3 min-h-0">
                <button
                  onClick={addEnvironment}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 hover:border-brand/40 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus size={14} />
                  <span>Add Environment</span>
                </button>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar">
                  {environments.length === 0 ? (
                    <div className="text-center py-8 text-xs text-text-secondary font-medium italic">No environments.</div>
                  ) : (
                    environments.map(env => {
                      const isActive = activeEnvId === env.id;
                      const isSelected = selectedEnvForEditId === env.id;
                      return (
                        <div
                          key={env.id}
                          onClick={() => setSelectedEnvForEditId(env.id)}
                          className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                            isSelected 
                              ? 'bg-brand/10 border-brand/40 text-white' 
                              : 'bg-neutral-950/25 border-border-subtle hover:border-border-main text-text-secondary hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isActive ? (
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" title="Active Environment" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-neutral-600 shrink-0" />
                            )}
                            <span className="text-xs font-bold truncate">{env.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveEnvId(isActive ? 'none' : env.id);
                              }}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                                isActive 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:border-neutral-700 hover:text-white'
                              }`}
                              title={isActive ? "Deactivate" : "Set Active"}
                            >
                              {isActive ? 'Active' : 'Activate'}
                            </button>
                            <button
                              onClick={(e) => deleteEnvironment(env.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-red-400 rounded transition-opacity hover:bg-neutral-800"
                              title="Delete Environment"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Side: Variables Form */}
              <div className="flex-1 flex flex-col p-6 min-h-0 bg-bg-editor">
                {selectedEnvForEdit ? (
                  <div className="h-full flex flex-col gap-4 min-h-0">
                    {/* Rename Field */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Environment Name</label>
                      <input
                        type="text"
                        value={selectedEnvForEdit.name}
                        onChange={(e) => renameEnvironment(selectedEnvForEdit.id, e.target.value)}
                        className="w-full bg-bg-app border border-border-main rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-brand transition-colors"
                        placeholder="e.g. Production, Staging"
                      />
                    </div>

                    {/* Table of variables */}
                    <div className="flex-1 flex flex-col min-h-0 gap-2 mt-2">
                      <div className="flex items-center justify-between shrink-0">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Variables List</span>
                        <span className="text-[9px] text-text-secondary font-semibold">Inject syntax: <code className="bg-neutral-900 px-1 py-0.5 rounded text-brand font-mono">{"{{variableName}}"}</code></span>
                      </div>

                      {/* Header Row */}
                      <div className="grid grid-cols-[1.2fr_1.8fr_50px_40px] gap-2 px-3 py-2 bg-neutral-900/60 border border-border-subtle rounded-xl text-[9px] font-bold text-text-secondary uppercase tracking-wider shrink-0">
                        <span>Variable Key</span>
                        <span>Variable Value</span>
                        <span className="text-center">Active</span>
                        <span className="text-right">Action</span>
                      </div>

                      {/* Content Rows */}
                      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar min-h-0">
                        {selectedEnvForEdit.variables.length === 0 ? (
                          <div className="text-center py-12 text-xs text-text-secondary italic">No variables added. Click below to add your first variable.</div>
                        ) : (
                          selectedEnvForEdit.variables.map((v, idx) => (
                            <div key={idx} className="grid grid-cols-[1.2fr_1.8fr_50px_40px] gap-2 px-1 items-center animate-in fade-in duration-150">
                              <input
                                type="text"
                                value={v.key}
                                onChange={(e) => updateVariable(selectedEnvForEdit.id, idx, 'key', e.target.value)}
                                placeholder="baseUrl"
                                className="w-full bg-bg-app border border-border-main hover:border-border-subtle focus:border-brand/40 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none transition-colors"
                              />
                              <input
                                type="text"
                                value={v.value}
                                onChange={(e) => updateVariable(selectedEnvForEdit.id, idx, 'value', e.target.value)}
                                placeholder="https://api.github.com"
                                className="w-full bg-bg-app border border-border-main hover:border-border-subtle focus:border-brand/40 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none transition-colors"
                              />
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={v.enabled}
                                  onChange={(e) => updateVariable(selectedEnvForEdit.id, idx, 'enabled', e.target.checked)}
                                  className="w-4 h-4 rounded border-border-main text-brand bg-bg-app focus:ring-brand/20 cursor-pointer accent-brand"
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => deleteVariable(selectedEnvForEdit.id, idx)}
                                  className="p-1.5 text-text-secondary hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                                  title="Delete Variable"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <button
                        onClick={() => addVariable(selectedEnvForEdit.id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand hover:text-brand/80 transition-colors cursor-pointer mt-1 self-start"
                      >
                        <Plus size={13} />
                        <span>Add Variable Row</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary gap-3">
                    <Globe size={32} className="text-neutral-700" />
                    <span className="text-xs font-semibold">Select or create an environment from the left sidebar to manage variables.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-main flex justify-end gap-3 bg-neutral-900/40 shrink-0">
              <button
                onClick={() => setShowEnvModal(false)}
                className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 border border-border-subtle text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side JSON Diff Modal */}
      {showDiffModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDiffModal(false)}
          />
          <div className="relative w-full max-w-6xl h-[80vh] min-h-[500px] bg-bg-editor border border-border-main rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-main bg-neutral-900/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                  <GitCompare size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">JSON Request Body Diff Viewer</h3>
                  <p className="text-[10px] text-text-secondary font-semibold">Compare your current payload with previously sent requests side-by-side.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDiffModal(false)}
                className="text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selector bar */}
            <div className="px-6 py-3 border-b border-border-main bg-bg-app/40 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Compare current with:</span>
                {historyWithBodies.length === 0 ? (
                  <span className="text-xs text-text-secondary italic">No request history with bodies found.</span>
                ) : (
                  <select
                    value={selectedHistoryId}
                    onChange={(e) => setSelectedHistoryId(e.target.value)}
                    className="bg-neutral-900 border border-border-subtle rounded-lg text-xs text-white px-3 py-1.5 outline-none focus:border-brand/40 cursor-pointer font-bold max-w-[320px]"
                  >
                    {historyWithBodies.map((h, index) => {
                      const dateStr = new Date(h.timestamp).toLocaleTimeString();
                      return (
                        <option key={h.id} value={h.id}>
                          {index === 0 ? 'Last Sent' : `Request #${historyWithBodies.length - index}`} ({h.method} {h.url.length > 25 ? h.url.substring(0, 25) + '...' : h.url}) - {dateStr}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Status Banner */}
              <div className="flex items-center gap-2">
                {!diffResult.hasDiffs ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-[10px] font-bold text-green-400 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    Payloads are Identical
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-[10px] font-bold text-brand select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block animate-pulse" />
                    Differences Detected
                  </div>
                )}
              </div>
            </div>

            {/* Labels for left/right */}
            <div className="grid grid-cols-2 bg-neutral-900/60 border-b border-border-main text-[10px] font-bold text-text-secondary uppercase tracking-widest shrink-0 select-none">
              <div className="px-6 py-2 border-r border-border-main flex items-center justify-between">
                <span>Reference (Last/Selected Sent Body)</span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px]">Removed (-)</span>
              </div>
              <div className="px-6 py-2 flex items-center justify-between">
                <span>Current Body (Editor payload)</span>
                <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[9px]">Added (+)</span>
              </div>
            </div>

            {/* Diff content scrollpane */}
            <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs bg-neutral-950/20 min-h-0">
              {!lastSentBody ? (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary gap-2 p-8 text-center select-none">
                  <GitCompare size={32} className="text-neutral-700 animate-pulse" />
                  <p className="text-xs font-semibold">No previously sent payloads found in history to compare against.</p>
                  <p className="text-[10px] max-w-xs">Send a request with a body (POST, PUT, etc.) first to populate the comparison baseline.</p>
                </div>
              ) : (
                <div className="min-w-full">
                  {diffResult.left.map((leftLine, idx) => {
                    const rightLine = diffResult.right[idx];

                    let leftBg = 'bg-transparent';
                    let leftText = 'text-neutral-400';
                    if (leftLine.type === 'removed') {
                      leftBg = 'bg-red-500/5 border-l-2 border-red-500/70';
                      leftText = 'text-red-300';
                    } else if (leftLine.type === 'empty') {
                      leftBg = 'bg-neutral-900/10 opacity-20';
                    }

                    let rightBg = 'bg-transparent';
                    let rightText = 'text-neutral-200';
                    if (rightLine.type === 'added') {
                      rightBg = 'bg-green-500/5 border-l-2 border-green-500/70';
                      rightText = 'text-green-300';
                    } else if (rightLine.type === 'empty') {
                      rightBg = 'bg-neutral-900/10 opacity-20';
                    }

                    return (
                      <div key={idx} className="grid grid-cols-2 border-b border-neutral-900/30 hover:bg-neutral-900/10 leading-relaxed font-mono">
                        {/* Left Side (Reference) */}
                        <div className={`flex items-start gap-3 px-4 py-1.5 border-r border-neutral-900/30 min-h-[26px] ${leftBg} ${leftText}`}>
                          <span className="w-6 text-[9px] text-neutral-600 text-right shrink-0 select-none font-mono">
                            {leftLine.lineNumber ?? ''}
                          </span>
                          <span className="shrink-0 text-red-500/40 w-2.5 text-center font-bold font-mono">
                            {leftLine.type === 'removed' ? '-' : ''}
                          </span>
                          <pre className="whitespace-pre-wrap break-all flex-1 font-mono text-[11px] leading-relaxed select-text">
                            {leftLine.content}
                          </pre>
                        </div>

                        {/* Right Side (Current Body) */}
                        <div className={`flex items-start gap-3 px-4 py-1.5 min-h-[26px] ${rightBg} ${rightText}`}>
                          <span className="w-6 text-[9px] text-neutral-600 text-right shrink-0 select-none font-mono">
                            {rightLine.lineNumber ?? ''}
                          </span>
                          <span className="shrink-0 text-green-500/40 w-2.5 text-center font-bold font-mono">
                            {rightLine.type === 'added' ? '+' : ''}
                          </span>
                          <pre className="whitespace-pre-wrap break-all flex-1 font-mono text-[11px] leading-relaxed select-text">
                            {rightLine.content}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-main flex justify-between items-center bg-neutral-900/40 shrink-0">
              <div className="text-[10px] text-text-secondary font-semibold select-none hidden sm:block">
                Tip: Format (Pretty Print) your JSON payload first to make comparing complex nested items cleaner.
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 border border-border-subtle text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Close Diff Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Analytics Dashboard Modal */}
      {showDashboardModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDashboardModal(false)}
          />
          <div className="relative w-full max-w-6xl h-[85vh] min-h-[550px] bg-bg-editor border border-border-main rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-main bg-neutral-900/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Performance Metrics Dashboard</h3>
                  <p className="text-[10px] text-text-secondary font-semibold">Analyze request latency, data volume, and API status distributions.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDashboardModal(false)}
                className="text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Pane */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 bg-neutral-950/20">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary gap-3 p-12 text-center select-none my-auto">
                  <div className="w-16 h-16 rounded-full bg-neutral-900/50 flex items-center justify-center border border-border-subtle animate-pulse">
                    <BarChart2 size={32} className="text-neutral-600" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">No Telemetry Data Found</h4>
                  <p className="text-xs max-w-md leading-relaxed">
                    The visual dashboard displays performance charts of your recent requests. Send a request from the REST API tool first to populate real-time metrics.
                  </p>
                  <button
                    onClick={() => {
                      setShowDashboardModal(false);
                      if (!url) {
                        setUrl('https://api.github.com/zen');
                        setQueryParams(parseParamsFromUrl('https://api.github.com/zen'));
                      }
                    }}
                    className="mt-2 px-4 py-2 bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Return to Send a Request
                  </button>
                </div>
              ) : (
                <>
                  {/* Overview Stats Bento Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Total Requests */}
                    <div className="p-4 bg-bg-app border border-border-main rounded-xl flex flex-col gap-1 shadow-sm">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="text-[9px] font-bold uppercase tracking-wider">Total Requests</span>
                        <Activity size={14} className="text-blue-400" />
                      </div>
                      <span className="text-2xl font-black text-white font-mono leading-tight">
                        {dashboardMetrics.totalRequests}
                      </span>
                      <span className="text-[9px] text-text-secondary font-semibold">Active telemetry events</span>
                    </div>

                    {/* Avg Latency */}
                    <div className="p-4 bg-bg-app border border-border-main rounded-xl flex flex-col gap-1 shadow-sm">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="text-[9px] font-bold uppercase tracking-wider">Avg Latency</span>
                        <Clock size={14} className="text-brand" />
                      </div>
                      <span className={`text-2xl font-black font-mono leading-tight ${
                        dashboardMetrics.avgLatency < 300 ? 'text-green-400' :
                        dashboardMetrics.avgLatency < 800 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {dashboardMetrics.avgLatency}<span className="text-xs font-bold ml-0.5">ms</span>
                      </span>
                      <span className="text-[9px] text-text-secondary font-semibold">Mean response overhead</span>
                    </div>

                    {/* Success Rate */}
                    <div className="p-4 bg-bg-app border border-border-main rounded-xl flex flex-col gap-1 shadow-sm">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="text-[9px] font-bold uppercase tracking-wider">Success Rate</span>
                        <Percent size={14} className="text-emerald-400" />
                      </div>
                      <span className={`text-2xl font-black font-mono leading-tight ${
                        dashboardMetrics.successRate >= 90 ? 'text-emerald-400' :
                        dashboardMetrics.successRate >= 70 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {dashboardMetrics.successRate}%
                      </span>
                      <span className="text-[9px] text-text-secondary font-semibold">Status 2xx ratio</span>
                    </div>

                    {/* Avg/Total Size */}
                    <div className="p-4 bg-bg-app border border-border-main rounded-xl flex flex-col gap-1 shadow-sm">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="text-[9px] font-bold uppercase tracking-wider">Data Ingress</span>
                        <Database size={14} className="text-indigo-400" />
                      </div>
                      <span className="text-2xl font-black text-white font-mono leading-tight">
                        {dashboardMetrics.totalSize}<span className="text-xs font-bold ml-0.5">KB</span>
                      </span>
                      <span className="text-[9px] text-text-secondary font-semibold">Avg: {dashboardMetrics.avgSize} KB/req</span>
                    </div>

                    {/* Peak Latency */}
                    <div className="p-4 bg-bg-app border border-border-main rounded-xl flex flex-col gap-1 shadow-sm col-span-2 md:col-span-1">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="text-[9px] font-bold uppercase tracking-wider">Peak Latency</span>
                        <Zap size={14} className="text-purple-400" />
                      </div>
                      <span className="text-2xl font-black text-white font-mono leading-tight">
                        {dashboardMetrics.maxLatency}<span className="text-xs font-bold ml-0.5">ms</span>
                      </span>
                      <span className="text-[9px] text-text-secondary font-semibold">Slowest transaction</span>
                    </div>
                  </div>

                  {/* Charts Bento Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Latency Area Chart */}
                    <div className="lg:col-span-8 p-5 bg-bg-app border border-border-main rounded-xl flex flex-col gap-4 shadow-sm min-h-[320px]">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Latency Trend (ms)</span>
                          <span className="text-[10px] text-text-secondary">Round-trip execution time per chronological request</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-brand/15 text-[9px] text-brand font-bold flex items-center gap-1">
                          <TrendingUp size={10} /> Live Telemetry
                        </span>
                      </div>
                      <div className="flex-1 w-full min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dashboardMetrics.latencyTimeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1254ff" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#1254ff" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <XAxis dataKey="name" stroke="#555" fontSize={9} fontStyle="bold" tickLine={false} />
                            <YAxis stroke="#555" fontSize={9} fontStyle="bold" tickLine={false} unit="ms" />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 1 }} />
                            <Area type="monotone" dataKey="latency" unit="ms" stroke="#1254ff" strokeWidth={2.5} fillOpacity={1} fill="url(#latencyGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Status Code Pie Chart */}
                    <div className="lg:col-span-4 p-5 bg-bg-app border border-border-main rounded-xl flex flex-col gap-4 shadow-sm min-h-[320px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">HTTP Status Codes</span>
                        <span className="text-[10px] text-text-secondary">Distribution of response classifications</span>
                      </div>
                      <div className="flex-1 w-full min-h-[200px] flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#111', borderColor: '#222', borderRadius: '12px' }} 
                              itemStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }} 
                            />
                            <Pie
                              data={dashboardMetrics.statusDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {dashboardMetrics.statusDistribution.map((entry, index) => {
                                const colors: Record<string, string> = {
                                  '2xx Success': '#10B981',
                                  '3xx Redirect': '#3B82F6',
                                  '4xx Client Error': '#F59E0B',
                                  '5xx Server Error': '#EF4444',
                                  'Failed': '#DC2626'
                                };
                                return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#6B7280'} />;
                              })}
                            </Pie>
                            <Legend 
                              verticalAlign="bottom" 
                              height={36} 
                              iconType="circle" 
                              iconSize={8}
                              wrapperStyle={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 'bold' }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none">
                          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none">Successful</span>
                          <span className="text-xl font-extrabold text-white font-mono mt-0.5 leading-none">
                            {dashboardMetrics.successRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dual-Column: Size Chart & Audit Logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Response Size Bar Chart */}
                    <div className="lg:col-span-5 p-5 bg-bg-app border border-border-main rounded-xl flex flex-col gap-4 shadow-sm min-h-[300px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Payload Size (KB)</span>
                        <span className="text-[10px] text-text-secondary">Inbound transaction payload size</span>
                      </div>
                      <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dashboardMetrics.sizeTimeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <XAxis dataKey="name" stroke="#555" fontSize={9} fontStyle="bold" tickLine={false} />
                            <YAxis stroke="#555" fontSize={9} fontStyle="bold" tickLine={false} unit="KB" />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#222', opacity: 0.3 }} />
                            <Bar dataKey="size" unit="KB" fill="#D946EF" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Interactive Telemetry Log Table */}
                    <div className="lg:col-span-7 p-5 bg-bg-app border border-border-main rounded-xl flex flex-col gap-3 shadow-sm min-h-[300px]">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Detailed Request Audit Log</span>
                          <span className="text-[10px] text-text-secondary">Select any row below to immediately reload that request configuration.</span>
                        </div>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to clear all history telemetry?')) {
                              setHistory([]);
                            }
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold"
                        >
                          Clear Audit
                        </button>
                      </div>

                      <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border-subtle text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                              <th className="pb-2.5 pl-2">Status / Method</th>
                              <th className="pb-2.5">Endpoint URL</th>
                              <th className="pb-2.5 text-right">Latency</th>
                              <th className="pb-2.5 pr-2 text-right">Size</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardMetrics.recentLogs.map((log) => {
                              const isSuccess = (log.statusCode ?? 200) >= 200 && (log.statusCode ?? 200) < 300;
                              return (
                                <tr 
                                  key={log.id} 
                                  onClick={() => {
                                    setUrl(log.url);
                                    setQueryParams(parseParamsFromUrl(log.url));
                                    setMethod(log.method.replace(' (MOCK)', ''));
                                    setHeaders(log.headers);
                                    setBody(log.body);
                                    setAuthType(log.authType || 'none');
                                    setBasicUser(log.basicUser || '');
                                    setBasicPass(log.basicPass || '');
                                    setBearerToken(log.bearerToken || '');
                                    setApiKeyName(log.apiKeyName || 'X-API-Key');
                                    setApiKeyValue(log.apiKeyValue || '');
                                    setTimeoutSec(log.timeoutSec !== undefined ? log.timeoutSec : 30);
                                    setShowDashboardModal(false);
                                    if (log.body) setActiveTab('body');
                                    else if (log.authType && log.authType !== 'none') setActiveTab('auth');
                                    else setActiveTab('headers');
                                  }}
                                  className="border-b border-border-subtle/40 hover:bg-neutral-900/40 cursor-pointer transition-colors group"
                                >
                                  <td className="py-2 pl-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded ${
                                        log.statusCode === 0 ? 'bg-red-500/20 text-red-400' :
                                        isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                      }`}>
                                        {log.statusCode === 0 ? 'FAIL' : log.statusCode}
                                      </span>
                                      <span className="text-[10px] font-extrabold text-neutral-400 font-mono">
                                        {log.method}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2 max-w-[180px] sm:max-w-[240px] truncate pr-2">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-white font-medium text-[11px] truncate group-hover:text-brand transition-colors">
                                        {log.url}
                                      </span>
                                      {log.error && (
                                        <span className="text-[9px] text-red-400 font-semibold truncate leading-none">
                                          {log.error}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2 text-right font-mono font-bold text-white text-[11px]">
                                    {log.responseTime ?? 0}ms
                                  </td>
                                  <td className="py-2 pr-2 text-right font-mono text-text-secondary text-[11px]">
                                    {log.responseSize ?? 0} KB
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-main flex justify-between items-center bg-neutral-900/40 shrink-0">
              <div className="text-[10px] text-text-secondary font-semibold select-none hidden sm:block">
                All requests are safely evaluated and measured locally to safeguard API secrets.
              </div>
              <button
                onClick={() => setShowDashboardModal(false)}
                className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 border border-border-subtle text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
