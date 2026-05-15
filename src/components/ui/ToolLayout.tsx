import React from 'react';
import { Copy, Trash2, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onClear?: () => void;
}

export default function ToolLayout({ title, description, children, actions, onClear }: ToolLayoutProps) {
  return (
    <div className="flex flex-col h-full bg-bg-app">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-bg-sidebar border-b border-border-main gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-text-secondary text-[11px] font-medium tracking-tight uppercase opacity-70">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <div className="w-px h-4 bg-border-main mx-1" />
          {onClear && (
            <button 
              onClick={onClear}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col p-6 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs transition-all border ${
        copied 
          ? 'bg-green-500/10 border-green-500/50 text-green-400' 
          : 'bg-bg-header border-border-subtle hover:bg-neutral-700 text-text-secondary hover:text-text-main'
      }`}
    >
      {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
      <span>{copied ? 'Copied' : 'Copy Output'}</span>
    </button>
  );
}
