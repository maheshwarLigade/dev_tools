import React, { useState, useMemo } from 'react';
import ToolLayout from '../ui/ToolLayout';
import { Search, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('Hello! Contact us at support@devforge.com or sales@example.org for more info.');

  const results = useMemo(() => {
    if (!pattern) return { matches: [], error: null };
    
    try {
      // Add 'd' flag for indices if not present, but check if browser supports it
      const finalFlags = flags.includes('d') ? flags : flags + 'd';
      const regex = new RegExp(pattern, finalFlags);
      const matches: any[] = [];
      let match;

      if (finalFlags.includes('g')) {
        while ((match = regex.exec(testText)) !== null) {
          if (match.index === regex.lastIndex) regex.lastIndex++; 
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
            indices: (match as any).indices || []
          });
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
            indices: (match as any).indices || []
          });
        }
      }

      return { matches, error: null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, testText]);

  const groupColors = [
    'bg-blue-500/20 border-blue-500/40 text-blue-300',
    'bg-purple-500/20 border-purple-500/40 text-purple-300',
    'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    'bg-orange-500/20 border-orange-500/40 text-orange-300',
    'bg-pink-500/20 border-pink-500/40 text-pink-300',
    'bg-amber-500/20 border-amber-500/40 text-amber-300',
    'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
    'bg-rose-500/20 border-rose-500/40 text-rose-300',
    'bg-lime-500/20 border-lime-500/40 text-lime-300',
  ];

  const renderHighlightedMatch = (match: any, matchIndex: number) => {
    // If no indices (e.g. older browser or no groups), fallback to simple highlight
    if (!match.indices || match.indices.length <= 1) {
      return (
        <mark 
          key={matchIndex} 
          className="bg-brand/30 text-brand-light px-0.5 rounded border border-brand/40 font-bold"
          title={`Match ${matchIndex + 1}`}
        >
          {match.text}
        </mark>
      );
    }

    // Capture groups (indices 1+)
    const groupIndices = match.indices.slice(1)
      .map((idx: [number, number], i: number) => ({ 
        start: idx[0], 
        end: idx[1], 
        index: i + 1 
      }))
      .filter((g: any) => g.start !== undefined);

    // Sort groups: primary by start index, secondary by length (longer first)
    // This allows us to handle nested groups by rendering outer ones then inner ones
    const sortedGroups = groupIndices.sort((a: any, b: any) => {
      if (a.start !== b.start) return a.start - b.start;
      return b.end - a.end;
    });

    // Helper to render ranges within the match
    const renderContent = (start: number, end: number, level: number): React.ReactNode[] => {
      const children: React.ReactNode[] = [];
      let currentPos = start;

      // Find groups that are directly inside this range
      const subGroups = sortedGroups.filter(g => g.start >= start && g.end <= end && g.start >= currentPos);

      subGroups.forEach((group) => {
        // Find if this group is already "behind" us (nested inside another already rendered tag)
        if (group.start < currentPos) return;
        
        // Add text before the group
        if (group.start > currentPos) {
          children.push(testText.substring(currentPos, group.start));
        }

        // Add the group itself
        const colorClass = groupColors[(group.index - 1) % groupColors.length];
        children.push(
          <span 
            key={`${level}-${group.index}`}
            className={`inline px-0.5 rounded border ${colorClass} transition-all hover:bg-white/10 cursor-help relative group/tag`}
            title={`Group ${group.index}: ${testText.substring(group.start, group.end)}`}
          >
            {renderContent(group.start, group.end, level + 1)}
            <span className="absolute -top-3 left-0 text-[8px] opacity-0 group-hover/tag:opacity-100 bg-black/80 px-1 rounded pointer-events-none">
              G{group.index}
            </span>
          </span>
        );

        currentPos = group.end;
      });

      // Add remaining text
      if (currentPos < end) {
        children.push(testText.substring(currentPos, end));
      }

      return children;
    };

    const matchStart = match.indices[0][0];
    const matchEnd = match.indices[0][1];

    return (
      <mark 
        key={matchIndex} 
        className="bg-brand/10 text-brand-light px-1 rounded border border-brand/30 font-bold"
        title={`Match ${matchIndex + 1}`}
      >
        {renderContent(matchStart, matchEnd, 0)}
      </mark>
    );
  };

  const renderHighlightedText = () => {
    if (results.error || results.matches.length === 0) return testText;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    results.matches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(testText.substring(lastIndex, match.index));
      }

      // Add highlighted match (potentially with groups)
      parts.push(renderHighlightedMatch(match, i));

      lastIndex = match.index + match.text.length;
    });

    // Add remaining text
    if (lastIndex < testText.length) {
      parts.push(testText.substring(lastIndex));
    }

    return parts;
  };

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <ToolLayout 
      title="Regex Tester" 
      description="Design and test regular expressions with real-time match highlighting and group extraction."
      onClear={() => { setPattern(''); setTestText(''); }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="flex flex-col gap-6 h-full min-h-0">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Expression</label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">/</div>
                  <input 
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="w-full bg-bg-editor border border-border-main rounded pl-6 pr-6 py-3 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-brand"
                    placeholder="Enter regex pattern..."
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">/</div>
                </div>
                <div className="flex items-center gap-1 bg-bg-header border border-border-main rounded px-2">
                  {['g', 'i', 'm'].map(f => (
                    <button
                      key={f}
                      onClick={() => toggleFlag(f)}
                      className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-all ${
                        flags.includes(f) 
                        ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                        : 'text-text-secondary hover:bg-neutral-800'
                      }`}
                      title={f === 'g' ? 'Global' : f === 'i' ? 'Case Insensitive' : 'Multiline'}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {results.error && (
                <div className="flex items-center gap-2 text-red-500 text-[11px] mt-1 bg-red-500/10 p-2 rounded border border-red-500/20">
                  <AlertCircle size={14} />
                  <span className="font-mono">{results.error}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 flex-1 min-h-0">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Test String</label>
              <textarea 
                className="w-full h-48 bg-bg-editor border border-border-main rounded px-4 py-3 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-white resize-none"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to test against..."
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Matches ({results.matches.length})</label>
              {results.matches.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                  <CheckCircle2 size={12} />
                  <span>MATCH FOUND</span>
                </div>
              )}
            </div>
            <div className="flex-1 bg-bg-sidebar border border-border-main rounded-xl p-4 overflow-auto">
              {results.matches.length > 0 ? (
                <div className="space-y-3">
                  {results.matches.map((match, i) => (
                    <div key={i} className="bg-bg-header/50 border border-border-main rounded p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-brand uppercase">Match {i + 1}</span>
                        <span className="text-[10px] font-mono text-text-secondary">Index: {match.index}</span>
                      </div>
                      <div className="font-mono text-white mb-2 break-all">{match.text}</div>
                      {match.groups.length > 0 && (
                        <div className="pt-2 border-t border-border-main/50">
                          <span className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Groups</span>
                          <div className="grid grid-cols-1 gap-1">
                            {match.groups.map((group, gi) => {
                              const baseClass = groupColors[gi % groupColors.length];
                              const colorClass = baseClass.split(' ').find(c => c.startsWith('text-')) || 'text-brand-light';
                              const bgColorClass = baseClass.split(' ').find(c => c.startsWith('bg-')) || 'bg-brand/10';
                              const borderColorClass = baseClass.split(' ').find(c => c.startsWith('border-')) || 'border-brand/20';

                              return (
                                <div key={gi} className={`flex items-center gap-2 text-[11px] font-mono p-1.5 rounded border ${bgColorClass} ${borderColorClass} group/match`}>
                                  <span className={`font-bold shrink-0 px-1.5 py-0.5 rounded bg-black/20 ${colorClass}`}>G{gi + 1}</span>
                                  <span className={`${colorClass} break-all line-clamp-1 truncate flex-1`}>{group || '(null)'}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-30 gap-3 text-center p-4">
                  <Search size={48} />
                  <div className="text-sm">No matches found with current pattern</div>
                  <div className="text-[10px] max-w-[200px]">Try adjusting your regex or ensure flags like 'g' are set.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Highlight Preview</label>
          <div className="flex-1 bg-bg-editor border border-border-main rounded-xl p-6 font-mono text-sm leading-relaxed overflow-auto text-text-main/80 whitespace-pre-wrap relative">
            {renderHighlightedText()}
          </div>

          <div className="mt-4 p-4 bg-bg-header/50 border border-border-main rounded-xl">
            <div className="flex items-center justify-between mb-3 border-b border-border-main pb-2">
              <div className="flex items-center gap-2 text-brand">
                <Info size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Group Legend</span>
              </div>
              <span className="text-[9px] text-text-secondary italic">Hover groups in preview to see IDs</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {results.matches[0]?.groups.map((_, gi) => {
                const baseClass = groupColors[gi % groupColors.length];
                const colorClass = baseClass.split(' ').find(c => c.startsWith('text-')) || 'text-brand-light';
                const bgColorClass = baseClass.split(' ').find(c => c.startsWith('bg-')) || 'bg-brand/10';
                const borderColorClass = baseClass.split(' ').find(c => c.startsWith('border-')) || 'border-brand/20';
                
                return (
                  <div key={gi} className={`flex items-center gap-1.5 px-2 py-1 rounded border ${bgColorClass} ${borderColorClass}`}>
                    <span className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')}`}></span>
                    <span className={`text-[10px] font-bold ${colorClass}`}>Group {gi + 1}</span>
                  </div>
                );
              })}
              {(!results.matches[0] || results.matches[0].groups.length === 0) && (
                <span className="text-[10px] text-text-secondary opacity-50">No capture groups defined</span>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-bg-header/50 border border-border-main rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-brand">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Quick Reference</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono text-text-secondary">
              <div><span className="text-brand-light">.</span> - Any character</div>
              <div><span className="text-brand-light">\d</span> - Digit</div>
              <div><span className="text-brand-light">*</span> - 0 or more</div>
              <div><span className="text-brand-light">\w</span> - Word char</div>
              <div><span className="text-brand-light">+</span> - 1 or more</div>
              <div><span className="text-brand-light">\s</span> - Whitespace</div>
              <div><span className="text-brand-light">^</span> - Start line</div>
              <div><span className="text-brand-light">$</span> - End line</div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
