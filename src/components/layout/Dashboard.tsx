import React from 'react';
import { TOOLS, ToolDefinition } from '../../tools';
import { Search } from 'lucide-react';

interface DashboardProps {
  onSelectTool: (id: string) => void;
  searchQuery: string;
}

export default function Dashboard({ onSelectTool, searchQuery }: DashboardProps) {
  const filteredTools = TOOLS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12 text-left border-b border-border-main pb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Welcome to <span className="text-brand">DevForge</span>
        </h1>
        <p className="text-text-secondary text-base max-w-2xl">
          A comprehensive suite of developer utilities, locally powered and privacy-first.
          Search through the tools below or use the sidebar for quick access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map(tool => (
          <button 
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="flex items-start gap-4 p-4 bg-bg-sidebar border border-border-main rounded transition-all group hover:bg-neutral-800 hover:border-brand/40"
          >
            <div className="w-10 h-10 bg-bg-header rounded flex items-center justify-center shrink-0 group-hover:bg-brand/10 transition-colors">
              <tool.icon size={20} className="text-text-secondary group-hover:text-brand" />
            </div>
            
            <div className="flex flex-col items-start">
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-brand transition-colors">{tool.name}</h3>
              <p className="text-[11px] text-text-secondary leading-normal">
                {tool.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
