import { useState, useMemo } from 'react';
import ToolLayout from '../ui/ToolLayout';
import { Copy, Link as LinkIcon } from 'lucide-react';

export default function UrlParser() {
  const [input, setInput] = useState('https://user:pass@example.com:8080/path/to/page?name=ferret&color=purple#hash');

  const parsed = useMemo(() => {
    try {
      if (!input.trim()) return null;
      const url = new URL(input.trim());
      
      const searchParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });

      return {
        protocol: url.protocol,
        username: url.username,
        password: url.password,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        host: url.host,
        origin: url.origin,
        params: searchParams
      };
    } catch (e) {
      return null;
    }
  }, [input]);

  const sections = parsed ? [
    { label: 'Protocol', value: parsed.protocol },
    { label: 'Origin', value: parsed.origin },
    { label: 'Hostname', value: parsed.hostname },
    { label: 'Port', value: parsed.port || 'Default' },
    { label: 'Pathname', value: parsed.pathname },
    { label: 'Search', value: parsed.search || 'None' },
    { label: 'Hash', value: parsed.hash || 'None' },
    { label: 'Username', value: parsed.username || 'None' },
    { label: 'Password', value: parsed.password || 'None' },
  ] : [];

  return (
    <ToolLayout
      title="URL Parser"
      description="Parse URL strings and extract individual components and parameters."
      onClear={() => setInput('')}
    >
      <div className="flex flex-col gap-8 h-full">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Input URL</label>
          <div className="relative group">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-brand transition-colors" size={16} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-bg-editor border border-border-main rounded px-10 py-3 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-white"
              placeholder="https://example.com/path?query=val"
            />
          </div>
        </div>

        {parsed ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-auto pb-4">
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-80 pl-1">Components</h3>
               <div className="space-y-3">
                 {sections.map((sec, i) => (
                   <div key={i} className="flex items-center gap-4 group">
                      <span className="text-xs text-text-secondary font-medium w-32 shrink-0">{sec.label}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-bg-header border border-border-main rounded px-4 py-2 text-sm text-text-main font-mono shadow-inner truncate">
                          {sec.value}
                        </div>
                        <button 
                          onClick={() => navigator.clipboard.writeText(sec.value)}
                          className="p-1.5 hover:bg-neutral-800 rounded text-text-secondary hover:text-brand transition-colors border border-border-subtle"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-80 pl-1">Query Parameters</h3>
               {Object.keys(parsed.params).length > 0 ? (
                 <div className="bg-bg-sidebar border border-border-main rounded overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-bg-header border-b border-border-main text-text-secondary uppercase tracking-tighter font-bold">
                        <tr>
                          <th className="px-4 py-2 font-bold">Key</th>
                          <th className="px-4 py-2 font-bold">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(parsed.params).map(([key, value], i) => (
                          <tr key={i} className="border-b border-border-main/50 last:border-0 hover:bg-white/5">
                            <td className="px-4 py-2 font-mono text-brand">{key}</td>
                            <td className="px-4 py-2 font-mono text-text-main break-all">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               ) : (
                <div className="bg-bg-sidebar border border-border-main border-dashed rounded p-6 text-center text-text-secondary italic text-xs">
                  No query parameters found
                </div>
               )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary opacity-30 gap-4">
            <LinkIcon size={64} />
            <span className="text-sm">Enter a valid URL to parse</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
