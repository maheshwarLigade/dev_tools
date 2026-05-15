import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';

export default function BaseConverter() {
  const [decimal, setDecimal] = useState('255');

  const updateFromBase = (value: string, base: number) => {
    try {
      if (!value) {
        setDecimal('');
        return;
      }
      const parsed = parseInt(value, base);
      if (!isNaN(parsed)) {
        setDecimal(parsed.toString(10));
      }
    } catch (e) {
      // Ignore invalid inputs
    }
  };

  const getValInBase = (base: number) => {
    if (!decimal) return '';
    const num = parseInt(decimal, 10);
    if (isNaN(num)) return '';
    return num.toString(base).toUpperCase();
  };

  const bases = [
    { name: 'Decimal', base: 10, placeholder: 'e.g. 255' },
    { name: 'Hexadecimal', base: 16, placeholder: 'e.g. FF' },
    { name: 'Binary', base: 2, placeholder: 'e.g. 11111111' },
    { name: 'Octal', base: 8, placeholder: 'e.g. 377' },
    { name: 'Base 32', base: 32, placeholder: '' },
    { name: 'Base 36', base: 36, placeholder: '' },
  ];

  return (
    <ToolLayout 
      title="Number Base Converter" 
      description="Convert numbers between different bases. Edit any field to convert from that base."
      onClear={() => setDecimal('')}
    >
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {bases.map((b) => (
            <div key={b.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{b.name} (Base {b.base})</label>
                {decimal && <CopyButton text={getValInBase(b.base)} />}
              </div>
              <input 
                type="text"
                value={getValInBase(b.base)}
                onChange={(e) => updateFromBase(e.target.value, b.base)}
                placeholder={b.placeholder}
                className="w-full bg-bg-editor border border-border-main rounded px-4 py-3 text-lg font-mono outline-none focus:border-brand/50 transition-colors text-white"
              />
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-bg-sidebar border border-border-main rounded-xl">
           <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-80 mb-4">Quick Reference</h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] font-mono">
              <div className="space-y-1">
                <span className="text-text-secondary block">DEC 10</span>
                <span className="text-brand block">HEX A</span>
                <span className="text-text-main block">BIN 1010</span>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary block">DEC 16</span>
                <span className="text-brand block">HEX 10</span>
                <span className="text-text-main block">BIN 10000</span>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary block">DEC 32</span>
                <span className="text-brand block">HEX 20</span>
                <span className="text-text-main block">BIN 100000</span>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary block">DEC 255</span>
                <span className="text-brand block">HEX FF</span>
                <span className="text-text-main block">BIN 11111111</span>
              </div>
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
