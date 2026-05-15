import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { Eye, Code, Download, Copy, ZoomIn, ZoomOut, RotateCcw, Hand, Undo2, Redo2 } from 'lucide-react';

interface HistoryState {
  input: string;
  scale: number;
  position: { x: number; y: number };
}

export default function SvgEditor() {
  const [input, setInput] = useState('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n  <circle cx="12" cy="12" r="10" />\n  <path d="M12 8v4" />\n  <path d="M12 16h.01" />\n</svg>');
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // History state
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const isInternalUpdate = useRef(false);
  const lastPushedRef = useRef<HistoryState | null>(null);

  const saveState = useCallback((state: HistoryState) => {
    if (isInternalUpdate.current) return;
    
    // Check if state is different enough to save
    const last = lastPushedRef.current;
    if (last && 
        last.input === state.input && 
        last.scale === state.scale && 
        last.position.x === state.position.x && 
        last.position.y === state.position.y) {
      return;
    }

    setPast(prev => [...prev.slice(-49), { ...state }]); // Keep last 50 states
    setFuture([]);
    lastPushedRef.current = state;
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    
    const currentState = { input, scale, position };
    const previousState = past[past.length - 1];
    
    isInternalUpdate.current = true;
    setFuture(prev => [currentState, ...prev]);
    setPast(prev => prev.slice(0, -1));
    
    setInput(previousState.input);
    setScale(previousState.scale);
    setPosition(previousState.position);
    lastPushedRef.current = previousState;
    
    setTimeout(() => { isInternalUpdate.current = false; }, 0);
  }, [past, input, scale, position]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    
    const currentState = { input, scale, position };
    const nextState = future[0];
    
    isInternalUpdate.current = true;
    setPast(prev => [...prev, currentState]);
    setFuture(prev => prev.slice(1));
    
    setInput(nextState.input);
    setScale(nextState.scale);
    setPosition(nextState.position);
    lastPushedRef.current = nextState;
    
    setTimeout(() => { isInternalUpdate.current = false; }, 0);
  }, [future, input, scale, position]);

  // Debounced input change for history
  useEffect(() => {
    const timer = setTimeout(() => {
      saveState({ input, scale, position });
    }, 500);
    return () => clearTimeout(timer);
  }, [input, saveState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    saveState({ input, scale, position }); // Save before starting drag
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  }, [isDragging]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      saveState({ input, scale, position }); // Save before zoom
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.min(Math.max(0.1, prev * delta), 10));
    }
  };

  const resetViewport = () => {
    saveState({ input, scale, position }); // Save before reset
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const downloadSvg = () => {
    const blob = new Blob([input], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icon-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
  };

  return (
    <ToolLayout
      title="SVG Editor"
      description="Edit and preview SVG code in real-time. Perfectly visualize your vector assets."
      onClear={() => setInput('')}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-2 text-brand">
              <Code size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">SVG Code</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={undo}
                disabled={past.length === 0}
                className={`p-1.5 rounded transition-colors ${past.length === 0 ? 'text-text-secondary/30 bg-transparent cursor-not-allowed' : 'hover:bg-white/5 text-text-secondary'}`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={14} />
              </button>
              <button 
                onClick={redo}
                disabled={future.length === 0}
                className={`p-1.5 rounded transition-colors ${future.length === 0 ? 'text-text-secondary/30 bg-transparent cursor-not-allowed' : 'hover:bg-white/5 text-text-secondary'}`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={14} />
              </button>
              <div className="h-4 w-[1px] bg-border-main mx-1" />
              <button 
                onClick={copyToClipboard}
                className="p-1.5 rounded hover:bg-white/5 text-text-secondary transition-colors"
                title="Copy Code"
              >
                <Copy size={14} />
              </button>
              <button 
                onClick={downloadSvg}
                className="p-1.5 rounded hover:bg-white/5 text-text-secondary transition-colors"
                title="Download SVG"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-bg-editor rounded-xl border border-border-main overflow-hidden shadow-2xl">
            <CodeEditor
              value={input}
              onChange={setInput}
              language="html"
              placeholder="Paste <svg> code here..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full min-h-0">
           <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-2 text-brand">
              <Eye size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Live Preview</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-bg-header rounded-lg p-1 border border-border-main">
                <button 
                  onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))}
                  className="p-1 hover:bg-white/5 text-text-secondary rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={12} />
                </button>
                <span className="text-[10px] font-mono text-text-main w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button 
                  onClick={() => setScale(prev => Math.min(10, prev + 0.1))}
                  className="p-1 hover:bg-white/5 text-text-secondary rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={12} />
                </button>
              </div>
              <button 
                onClick={resetViewport}
                className="p-1.5 rounded hover:bg-white/5 text-text-secondary transition-colors"
                title="Reset View"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
          <div 
            className={`flex-1 min-h-0 bg-bg-sidebar border border-border-main rounded-xl flex items-center justify-center relative overflow-hidden group cursor-${isDragging ? 'grabbing' : 'grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Checkerboard background for transparency preview */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'conic-gradient(#fff 90deg, #000 90deg 180deg, #fff 180deg 270deg, #000 270deg)', backgroundSize: '20px 20px' }} 
            />
            
            <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
              <div 
                className="transition-transform duration-75 ease-out select-none"
                style={{ 
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: 'center'
                }}
                dangerouslySetInnerHTML={{ __html: input }} 
              />
            </div>

            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-white/70 font-mono border border-white/10">
               <Hand size={12} />
               <span>Drag to pan · Ctrl + Scroll to zoom</span>
            </div>
          </div>

          <div className="bg-bg-header/50 border border-border-main rounded-xl p-4">
             <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 opacity-70">Tips</div>
             <ul className="space-y-2">
                <li className="flex items-start gap-2 text-[10px] text-text-secondary">
                   <div className="w-1 h-1 rounded-full bg-brand mt-1.5 shrink-0" />
                   <span>Ensure your SVG has a <code className="text-brand-light">xmlns="http://www.w3.org/2000/svg"</code> attribute for best compatibility.</span>
                </li>
                <li className="flex items-start gap-2 text-[10px] text-text-secondary">
                   <div className="w-1 h-1 rounded-full bg-brand mt-1.5 shrink-0" />
                   <span>Use <code className="text-brand-light">currentColor</code> for strokes or fills to inherit color from parent elements.</span>
                </li>
             </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
