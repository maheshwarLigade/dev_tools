import { useState, useMemo } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { Type, Hash, AlignLeft, LetterText } from 'lucide-react';

export default function StringInspector() {
  const [input, setInput] = useState('DevTools: The ultimate developer utility belt.\n\nQuick brown fox jumps over the lazy dog.');

  const stats = useMemo(() => {
    const trimmed = input.trim();
    return {
      chars: input.length,
      charsNoSpaces: input.replace(/\s/g, '').length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      lines: input ? input.split('\n').length : 0,
      sentences: trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0,
      paragraphs: trimmed ? trimmed.split(/\n\s*\n/).length : 0,
      avgWordLen: trimmed ? (trimmed.replace(/\s/g, '').length / (trimmed.split(/\s+/).length)).toFixed(2) : 0,
    };
  }, [input]);

  const variations = [
    { name: 'Uppercase', value: input.toUpperCase() },
    { name: 'Lowercase', value: input.toLowerCase() },
    { name: 'Title Case', value: input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) },
    { name: 'Snake Case', value: input.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '') },
    { name: 'Kebab Case', value: input.toLowerCase().replace(/\s+/g, '-').replace(/[^\w]/g, '') },
    { name: 'Camel Case', value: input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()) },
  ];

  return (
    <ToolLayout
      title="String Inspector"
      description="Detailed text analysis, statistics, and common case transformations."
      onClear={() => setInput('')}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Input Text</label>
            <textarea
              className="flex-1 w-full bg-bg-editor border border-border-main rounded-xl px-6 py-4 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-white resize-none shadow-2xl"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your text here for analysis..."
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {variations.map((v) => (
              <div key={v.name} className="flex flex-col gap-1 bg-bg-sidebar border border-border-main rounded-lg p-3 group transition-all hover:border-brand/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">{v.name}</span>
                  <CopyButton text={v.value} />
                </div>
                <div className="text-[11px] font-mono text-text-main truncate opacity-80">{v.value || '...'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-bg-header/50 border border-border-main rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6 text-brand">
              <Hash size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Statistics</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Characters', value: stats.chars, icon: <Type size={14} /> },
                { label: 'Words', value: stats.words, icon: <LetterText size={14} /> },
                { label: 'Lines', value: stats.lines, icon: <AlignLeft size={14} /> },
                { label: 'Sentences', value: stats.sentences },
                { label: 'Paragraphs', value: stats.paragraphs },
                { label: 'Avg Word Length', value: stats.avgWordLen },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between border-b border-border-main/50 pb-2 last:border-0">
                  <div className="flex items-center gap-2 text-text-secondary">
                    {stat.icon}
                    <span className="text-xs font-medium">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white font-mono">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6">
             <h3 className="text-xs font-bold text-brand uppercase tracking-widest mb-4">Frequency Analysis</h3>
             <div className="space-y-2">
                <p className="text-[10px] text-text-secondary italic mb-4">Most frequent characters (top 5):</p>
                {Object.entries(
                  input.replace(/\s/g, '').split('').reduce((acc: any, char) => {
                    acc[char] = (acc[char] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 5)
                  .map(([char, count]: [string, any]) => (
                    <div key={char} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-brand/20 text-brand rounded flex items-center justify-center font-bold font-mono text-xs">{char}</div>
                      <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand" 
                          style={{ width: `${((count as number) / stats.chars) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-text-secondary">{count as number}</span>
                    </div>
                  ))}
             </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
