import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Terminal, 
  Menu,
  ChevronRight,
  RefreshCw,
  Command,
  Github,
  Keyboard,
  HelpCircle,
  X
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
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Intercept OAuth auth code if we are a popup and communicate back to parent
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code && window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code }, '*');
        window.close();
      }
    } catch (e) {
      console.error('Failed to handle OAuth popup intercept', e);
    }
  }, []);

  // Keyboard shortcut for command palette and sidebar / cheat-sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      // Toggle Sidebar (Ctrl+B or Cmd+B)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
      // Toggle Keyboard Shortcuts Cheat-sheet (Ctrl+/ or Cmd+/)
      else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      }
      // Close shortcuts modal on Escape
      else if (e.key === 'Escape') {
        setIsShortcutsModalOpen(false);
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
      <footer className="h-6 bg-brand text-white flex items-center justify-between px-3 text-[11px] shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <div className="flex rotate-45 border-2 border-white/40 p-0.5 rounded-sm"></div>
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-1 opacity-90 cursor-pointer hover:underline" onClick={() => setIsCommandPaletteOpen(true)}>
            <Command size={10} />
            <span>Search (Ctrl+K)</span>
          </div>
          <div className="flex items-center gap-1 opacity-90 cursor-pointer hover:underline" onClick={() => setIsShortcutsModalOpen(true)}>
            <Keyboard size={10} />
            <span>Shortcuts (Ctrl+/)</span>
          </div>
          <div className="flex items-center gap-1 opacity-90">
            <RefreshCw size={10} />
            <span>DevTools Engine v1.0.0</span>
          </div>
          <div className="h-3 w-[1px] bg-white/20 mx-1"></div>
          <a 
            href="https://github.com/maheshwarLigade/dev_tools" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 opacity-90 hover:opacity-100 hover:underline transition-all"
          >
            <Github size={10} />
            <span>v1.0.0 Stable</span>
          </a>
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

      {/* Keyboard Shortcuts Cheat-sheet Modal */}
      <AnimatePresence>
        {isShortcutsModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShortcutsModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl bg-bg-editor border border-border-main rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-text-main"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-main bg-bg-header/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                    <Keyboard size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Keyboard Shortcuts</h3>
                    <p className="text-[10px] text-text-secondary">Boost your productivity with quick keys</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShortcutsModalOpen(false)}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Section 1: Global Shortcuts */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-brand tracking-widest pl-1">Global Navigation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {[
                      { keys: ['Ctrl', 'K'], desc: 'Open Command Palette / Search' },
                      { keys: ['Ctrl', 'B'], desc: 'Toggle Sidebar Panel' },
                      { keys: ['Ctrl', '/'], desc: 'Toggle Keyboard Shortcuts' },
                      { keys: ['Esc'], desc: 'Close open dialogs or modals' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-bg-header/20 border border-border-main/50 hover:border-border-subtle/40 transition-all">
                        <span className="text-xs text-text-secondary">{item.desc}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && <span className="text-[10px] text-text-secondary/60 font-semibold">+</span>}
                              <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-neutral-800 border border-neutral-700 rounded text-neutral-200 font-mono shadow-sm">
                                {k}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: REST API Client shortcuts */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black uppercase text-brand tracking-widest pl-1">REST API Manager</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {[
                      { keys: ['Ctrl', 'Enter'], desc: 'Send Current API Request' },
                      { keys: ['Ctrl', 'S'], desc: 'Save Request as Snippet' },
                      { keys: ['Ctrl', 'O'], desc: 'Open Saved Snippets Library' },
                      { keys: ['Ctrl', 'I'], desc: 'Import cURL Request dialog' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-bg-header/20 border border-border-main/50 hover:border-border-subtle/40 transition-all">
                        <span className="text-xs text-text-secondary">{item.desc}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && <span className="text-[10px] text-text-secondary/60 font-semibold">+</span>}
                              <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-neutral-800 border border-neutral-700 rounded text-neutral-200 font-mono shadow-sm">
                                {k}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: SVG Canvas shortcuts */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black uppercase text-brand tracking-widest pl-1">SVG Canvas Editor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {[
                      { keys: ['Ctrl', 'Z'], desc: 'Undo last path / viewport edit' },
                      { keys: ['Ctrl', 'Y'], desc: 'Redo previously undone action' },
                      { keys: ['Ctrl', 'Scroll'], desc: 'Zoom workspace viewport canvas' },
                      { keys: ['Drag'], desc: 'Pan / Navigate viewport coordinates' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-bg-header/20 border border-border-main/50 hover:border-border-subtle/40 transition-all">
                        <span className="text-xs text-text-secondary">{item.desc}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && <span className="text-[10px] text-text-secondary/60 font-semibold">+</span>}
                              <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-neutral-800 border border-neutral-700 rounded text-neutral-200 font-mono shadow-sm">
                                {k}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-bg-header/50 border-t border-border-main/60 flex items-center justify-between text-[10px] text-text-secondary font-medium select-none">
                <span>Tip: Hovering on shortcuts reveals local tool contexts.</span>
                <span className="flex items-center gap-1">
                  Press <kbd className="px-1 py-0.2 text-[9px] bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-mono">ESC</kbd> to close at any time.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
