import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, X, ChevronRight } from 'lucide-react';
import { TOOLS, ToolDefinition } from '../../tools';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (toolId: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTools = useMemo(() => {
    if (!query) return TOOLS.slice(0, 8); // Show recent or first few when empty
    const normalizedQuery = query.toLowerCase();
    return TOOLS.filter(t => 
      t.name.toLowerCase().includes(normalizedQuery) || 
      t.description.toLowerCase().includes(normalizedQuery) ||
      t.category.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle focus
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredTools.length));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredTools.length) % Math.max(1, filteredTools.length));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTools[selectedIndex]) {
            handleSelect(filteredTools[selectedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, onClose]);

  const handleSelect = (toolId: string) => {
    onSelect(toolId);
    onClose();
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-6 md:px-20"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-bg-editor border border-border-main rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b border-border-main bg-bg-header/50">
              <Search className="text-text-secondary mr-3" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools or type a command..."
                className="flex-1 bg-transparent border-none outline-none text-text-main text-base placeholder:text-text-secondary/50"
              />
              <div className="flex items-center gap-1 ml-4 px-1.5 py-0.5 rounded border border-border-main bg-bg-app text-[10px] text-text-secondary font-mono">
                ESC
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar" ref={containerRef}>
              {filteredTools.length > 0 ? (
                <div className="px-2">
                  {filteredTools.map((tool, index) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect(tool.id)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-left transition-colors group ${
                        selectedIndex === index ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'hover:bg-white/5 text-text-main'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedIndex === index ? 'bg-white/20' : 'bg-bg-header group-hover:bg-white/10'}`}>
                        <tool.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm block truncate">{tool.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedIndex === index ? 'bg-white/20 text-white' : 'bg-bg-app text-text-secondary'}`}>
                            {tool.category}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${selectedIndex === index ? 'text-white/80' : 'text-text-secondary'}`}>
                          {tool.description}
                        </p>
                      </div>
                      <ChevronRight size={14} className={selectedIndex === index ? 'text-white' : 'text-text-secondary opacity-0 group-hover:opacity-100'} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-text-secondary">
                  <Command size={48} className="opacity-10 mb-4" />
                  <p className="text-sm">No tools found matching "{query}"</p>
                  <p className="text-[10px] mt-2 opacity-50 uppercase tracking-widest font-bold">Try searching for something else</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-bg-header/30 border-t border-border-main flex items-center justify-between text-[10px] text-text-secondary font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1 py-0.5 rounded border border-border-main bg-bg-app font-mono">↑↓</kbd> 
                  Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1 py-0.5 rounded border border-border-main bg-bg-app font-mono">↵</kbd> 
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>{filteredTools.length} tools available</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
