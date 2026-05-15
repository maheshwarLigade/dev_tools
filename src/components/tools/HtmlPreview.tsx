import { useState } from 'react';
import ToolLayout from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { Eye, Code } from 'lucide-react';

export default function HtmlPreview() {
  const [input, setInput] = useState('<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { font-family: system-ui; background: #111; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n  .card { background: #222; padding: 2rem; border-radius: 1rem; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }\n  h1 { color: #3b82f6; margin-top: 0; }\n</style>\n</head>\n<body>\n  <div class="card">\n    <h1>Hello World!</h1>\n    <p>This is a live HTML preview.</p>\n    <button style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">Click Me</button>\n  </div>\n</body>\n</html>');

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  return (
    <ToolLayout
      title="HTML Preview"
      description="Live renderer for your HTML and CSS snippets. Safely preview UI designs."
      onClear={() => setInput('')}
    >
      <div className="flex flex-col h-full gap-4">
        <div className="flex border-b border-border-main">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'editor' 
              ? 'border-brand text-brand bg-brand/5' 
              : 'border-transparent text-text-secondary hover:text-text-main hover:bg-white/5'
            }`}
          >
            <Code size={14} />
            Editor
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'preview' 
              ? 'border-brand text-brand bg-brand/5' 
              : 'border-transparent text-text-secondary hover:text-text-main hover:bg-white/5'
            }`}
          >
            <Eye size={14} />
            Live Preview
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-bg-editor rounded-xl border border-border-main overflow-hidden shadow-2xl">
          {activeTab === 'editor' ? (
            <CodeEditor
              value={input}
              onChange={setInput}
              language="html"
              placeholder="Enter your HTML/CSS code here..."
            />
          ) : (
            <div className="w-full h-full bg-white">
              <iframe
                title="HTML Preview"
                srcDoc={input}
                className="w-full h-full border-none"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
