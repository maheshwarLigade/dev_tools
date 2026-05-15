import React, { useState, useEffect } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

export default function UnixTimeConverter() {
  const [timestamp, setTimestamp] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      if (isNaN(date.getTime())) throw new Error();
      
      const formats = [
        { label: 'UTC', value: date.toUTCString() },
        { label: 'ISO 8601', value: date.toISOString() },
        { label: 'Local Time', value: date.toString() },
        { label: 'Relative', value: format(date, 'PPPPpppp') },
      ];
      
      setFormatted(formats.map(f => `${f.label}: ${f.value}`).join('\n'));
    } catch (e) {
      setFormatted('Invalid Timestamp');
    }
  }, [timestamp]);

  return (
    <ToolLayout 
      title="Unix Time Converter" 
      description="Convert Unix timestamps to human-readable dates and vice-versa."
      actions={
        <button 
          onClick={() => setTimestamp(Math.floor(Date.now() / 1000).toString())}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
        >
          <Clock size={14} />
          <span>Now</span>
        </button>
      }
    >
      <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full pt-12">
        <div className="flex flex-col gap-4 text-center">
          <label className="text-lg font-semibold text-slate-300">Enter Unix Timestamp (Seconds)</label>
          <input 
            type="text"
            className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-6 text-4xl font-mono text-center text-blue-400 outline-none focus:border-blue-500/50 transition-all shadow-2xl"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Interpretations</label>
            {formatted !== 'Invalid Timestamp' && <CopyButton text={formatted} />}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 font-mono text-sm leading-loose whitespace-pre text-slate-200 shadow-xl">
            {formatted}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
