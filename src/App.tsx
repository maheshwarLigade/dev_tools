import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Terminal, 
  Menu,
  ChevronRight,
  RefreshCw,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TOOLS, CATEGORIES } from './tools';
import ToolContainer from './components/layout/ToolContainer';
import CommandPalette from './components/layout/CommandPalette';

export default function App() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredTools = useMemo(() => {
    if (!searchQuery) return TOOLS;
    return TOOLS.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const activeTool = useMemo(() => 
    TOOLS.find(t => t.id === activeToolId) || null
  , [activeToolId]);

  return (
    <div className="flex flex-col h-screen w-full bg-bg-app text-text-main font-sans selection:bg-brand/30">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-bg-sidebar border-r border-border-main flex flex-col shrink-0"
            >
              <button 
                onClick={() => setActiveToolId(null)}
                className="p-4 border-b border-border-main flex items-center gap-3 hover:bg-white/5 transition-colors w-full text-left bg-bg-header/50"
              >
                <div className="w-8 h-8 bg-brand rounded flex items-center justify-center shadow-lg shadow-brand/20">
                  <Terminal size={18} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold tracking-tight text-sm text-white">DevTools</span>
                  <span className="text-[10px] text-text-secondary">v1.0.0</span>
                </div>
              </button>

              <div className="p-3">
                <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-brand transition-colors" size={14} />
                  <input 
                    type="text"
                    placeholder="Search utilities..."
                    className="w-full bg-bg-header border border-border-subtle rounded py-1.5 pl-8 pr-3 text-xs outline-none focus:border-brand transition-colors placeholder:text-neutral-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
                {CATEGORIES.map(category => {
                  const categoryTools = filteredTools.filter(t => t.category === category);
                  if (categoryTools.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h3 className="px-2 mb-1 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                        {category}
                      </h3>
                      <div className="space-y-0.5">
                        {categoryTools.map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => setActiveToolId(tool.id)}
                            className={`w-full flex items-center gap-3 px-2 py-1.5 rounded transition-all text-xs ${
                              activeToolId === tool.id 
                                ? 'bg-neutral-800 text-white font-medium border-l-2 border-brand' 
                                : 'text-text-secondary hover:bg-bg-header hover:text-text-main'
                            }`}
                          >
                            <tool.icon size={14} className={activeToolId === tool.id ? 'text-brand' : ''} />
                            <span>{tool.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-border-main flex items-center gap-2 text-[10px] text-text-secondary opacity-70">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Local Environment Active</span>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-bg-app">
          <header className="h-11 border-b border-border-main flex items-center justify-between px-4 bg-bg-header">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1 hover:bg-neutral-700 rounded text-text-secondary transition-colors"
              >
                <Menu size={18} />
              </button>
              <div className="flex items-center gap-2 text-xs">
                {activeTool ? (
                  <>
                    <span className="text-text-secondary">{activeTool.category}</span>
                    <ChevronRight size={12} className="text-text-secondary" />
                    <span className="font-medium text-white">{activeTool.name}</span>
                  </>
                ) : (
                  <span className="font-medium text-white">Dashboard</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeToolId || 'dashboard'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full w-full overflow-y-auto"
              >
                <ToolContainer 
                  tool={activeTool} 
                  onSelectTool={setActiveToolId} 
                  searchQuery={searchQuery} 
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-brand text-white flex items-center justify-between px-3 text-[11px] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <div className="flex rotate-45 border-2 border-white/40 p-0.5 rounded-sm"></div>
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-1 opacity-90 cursor-pointer hover:underline" onClick={() => setIsCommandPaletteOpen(true)}>
            <Command size={10} />
            <span>Search (Ctrl+K)</span>
          </div>
          <div className="flex items-center gap-1 opacity-90">
            <RefreshCw size={10} />
            <span>DevTools Engine v1.0.0</span>
          </div>
        </div>
        <div className="flex items-center gap-4 opacity-90">
          <span>UTF-8</span>
          <span className="font-medium">{activeTool?.name || 'Home'}</span>
          <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          </div>
        </div>
      </footer>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelect={setActiveToolId}
      />
    </div>
  );
}
