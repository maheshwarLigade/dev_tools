import React from 'react';
import { TOOLS, ToolDefinition } from '../../tools';
import { Search, Github, Monitor, Download } from 'lucide-react';

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
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-border-main pb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome to <span className="text-brand">DevTools</span>
          </h1>
          <p className="text-text-secondary text-base max-w-2xl">
            A comprehensive suite of developer utilities, locally powered and privacy-first.
            Search through the tools below or use the sidebar for quick access.
          </p>
        </div>
        <div className="shrink-0">
          <a 
            href="https://github.com/maheshwarLigade/dev_tools" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-border-main rounded-lg text-xs font-medium text-white transition-all hover:scale-105 active:scale-95"
          >
            <Github size={16} />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
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
              <p className="text-[11px] text-text-secondary leading-normal text-left">
                {tool.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Desktop Builds Section */}
      <div className="bg-gradient-to-br from-brand/10 via-bg-sidebar to-bg-sidebar border border-brand/20 rounded-2xl p-8 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Monitor size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-brand/20 rounded-lg text-brand">
              <Monitor size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Native Desktop Apps</h2>
          </div>
          <p className="text-text-secondary text-sm max-w-xl mb-6">
            Take DevTools offline and with you. Download the native builds for your preferred operating system.
            Available for Windows and Ubuntu Linux.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="https://github.com/maheshwarLigade/dev_tools/releases" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand/20 hover:-translate-y-0.5"
            >
              <Download size={18} />
              <span>Download for Windows/Ubuntu</span>
            </a>
            <div className="flex items-center gap-4 text-xs text-text-secondary font-medium px-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-brand"></div>
                Windows (x64)
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-brand"></div>
                Ubuntu (deb/AppImage)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
