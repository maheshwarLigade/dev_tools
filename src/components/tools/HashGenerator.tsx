import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CryptoJS from 'crypto-js';

export default function HashGenerator() {
  const [input, setInput] = useState('');
  
  const hashes = [
    { name: 'MD5', value: CryptoJS.MD5(input).toString() },
    { name: 'SHA1', value: CryptoJS.SHA1(input).toString() },
    { name: 'SHA256', value: CryptoJS.SHA256(input).toString() },
    { name: 'SHA512', value: CryptoJS.SHA512(input).toString() },
    { name: 'SHA3', value: CryptoJS.SHA3(input).toString() },
  ];

  return (
    <ToolLayout 
      title="Hash Generator" 
      description="Generate cryptographic hashes for your text data."
      onClear={() => setInput('')}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Input Text</label>
          <textarea 
            className="w-full min-h-[120px] bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm outline-none focus:border-blue-500/50 transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {hashes.map(hash => (
            <div key={hash.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500">{hash.name}</label>
                <button 
                  onClick={() => navigator.clipboard.writeText(hash.value)}
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Copy
                </button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs break-all text-slate-300">
                {input ? hash.value : <span className="text-slate-600">Enter input above...</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
