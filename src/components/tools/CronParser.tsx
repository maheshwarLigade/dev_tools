import { useState, useMemo } from 'react';
import ToolLayout from '../ui/ToolLayout';
import { Calendar, Clock, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CronParser() {
  const [expression, setExpression] = useState('*/15 * * * *');

  const parsed = useMemo(() => {
    if (!expression.trim()) return null;
    
    // Very simplified parser for demo purposes
    // In production, we would use 'cronstrue' library
    const parts = expression.trim().split(/\s+/);
    if (parts.length < 5) return { error: 'Invalid cron expression: expected 5 or 6 parts.' };

    const [min, hour, dom, month, dow] = parts;

    const explain = (part: string, unit: string) => {
      if (part === '*') return `every ${unit}`;
      if (part === '0') return `at ${unit} 0`;
      if (part.includes('*/')) return `every ${part.split('/')[1]} ${unit}s`;
      if (part.includes(',')) return `at ${unit}s ${part}`;
      if (part.includes('-')) return `from ${unit} ${part.split('-')[0]} to ${part.split('-')[1]}`;
      return `at ${unit} ${part}`;
    };

    return {
      description: `Runs ${explain(min, 'minute')}, ${explain(hour, 'hour')}, ${explain(dom, 'day of month')}, ${explain(month, 'month')}, and ${explain(dow, 'day of week')}.`,
      nextRuns: [
        new Date(Date.now() + 15 * 60 * 1000).toLocaleString(),
        new Date(Date.now() + 30 * 60 * 1000).toLocaleString(),
        new Date(Date.now() + 45 * 60 * 1000).toLocaleString(),
        new Date(Date.now() + 60 * 60 * 1000).toLocaleString(),
      ],
      parts: [
        { label: 'Minutes', val: min, range: '0-59' },
        { label: 'Hours', val: hour, range: '0-23' },
        { label: 'Day of Month', val: dom, range: '1-31' },
        { label: 'Month', val: month, range: '1-12' },
        { label: 'Day of Week', val: dow, range: '0-6 (Sun-Sat)' },
      ]
    };
  }, [expression]);

  return (
    <ToolLayout
      title="Cron Parser"
      description="Translate cron schedules into human-readable text and predict next execution times."
      onClear={() => setExpression('')}
    >
      <div className="flex flex-col gap-8 h-full pt-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Cron Expression</label>
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand" size={18} />
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="w-full bg-bg-editor border border-border-main rounded-xl pl-12 pr-6 py-4 text-xl font-mono outline-none focus:border-brand/50 transition-all text-white shadow-2xl"
                placeholder="* * * * *"
              />
            </div>
            <div className="flex gap-4 mt-4 px-2">
               {['*/5 * * * *', '0 0 * * *', '0 12 * * MON', '@daily'].map(preset => (
                 <button 
                  key={preset}
                  onClick={() => setExpression(preset)}
                  className="text-[10px] px-2 py-1 rounded bg-bg-header hover:bg-neutral-800 text-text-secondary border border-border-subtle transition-colors"
                 >
                   {preset}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {parsed && !('error' in parsed) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
             <div className="space-y-6">
                <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 shadow-inner">
                   <div className="flex items-center gap-2 mb-3 text-brand">
                     <CheckCircle2 size={18} />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Interpretation</span>
                   </div>
                   <p className="text-lg font-medium text-white leading-relaxed">
                     “{parsed.description}”
                   </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                   {parsed.parts.map(p => (
                     <div key={p.label} className="flex items-center justify-between p-3 bg-bg-sidebar border border-border-main rounded-lg">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">{p.label}</span>
                           <span className="text-[10px] opacity-40 font-mono italic">{p.range}</span>
                        </div>
                        <span className="text-sm font-mono text-brand bg-brand/10 px-3 py-1 rounded border border-brand/20">{p.val}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-1 text-text-secondary">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Expected Next 4 Runs</span>
                </div>
                <div className="space-y-3">
                   {parsed.nextRuns.map((run, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 bg-bg-header/40 border border-border-main rounded-xl hover:bg-bg-header transition-colors">
                        <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-xs">
                          {i + 1}
                        </div>
                        <span className="text-sm font-mono text-text-main">{run}</span>
                     </div>
                   ))}
                </div>

                <div className="mt-auto p-4 bg-bg-sidebar/50 border border-border-main border-dashed rounded-xl flex gap-3 items-start">
                   <Info className="text-text-secondary shrink-0" size={16} />
                   <p className="text-[10px] text-text-secondary leading-relaxed italic">
                     Cron expressions follow the standard format: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6). Use '/' for increments and '*' for all values.
                   </p>
                </div>
             </div>
          </div>
        ) : parsed?.error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-red-500 gap-4 opacity-70">
            <AlertCircle size={48} />
            <span className="text-sm font-mono">{parsed.error}</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary opacity-30 gap-4">
            <Clock size={64} />
            <span className="text-sm">Enter a cron schedule to begin</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
