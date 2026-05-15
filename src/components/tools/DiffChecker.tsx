import React, { useState } from 'react';
import ToolLayout from '../ui/ToolLayout';
import ReactDiffViewer from 'react-diff-viewer-continued';

export default function DiffChecker() {
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [splitView, setSplitView] = useState(true);

  return (
    <ToolLayout 
      title="Diff Checker" 
      description="Compare two blocks of text to find differences and see additions/removals."
      onClear={() => { setOldText(''); setNewText(''); }}
      actions={
        <button 
          onClick={() => setSplitView(!splitView)}
          className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300"
        >
          {splitView ? 'Unified View' : 'Split View'}
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Original Text</label>
          <textarea 
            className="w-full h-48 bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs outline-none focus:border-blue-500/50"
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
            placeholder="Paste original text here..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Modified Text</label>
          <textarea 
            className="w-full h-48 bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs outline-none focus:border-blue-500/50"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Paste modified text here..."
          />
        </div>
      </div>

      <div className="flex-1 bg-[#1e293b] rounded-lg overflow-auto border border-slate-800">
        <ReactDiffViewer 
          oldValue={oldText} 
          newValue={newText} 
          splitView={splitView}
          useDarkTheme={true}
          styles={{
            variables: {
              dark: {
                diffViewerBackground: '#0f172a',
                diffViewerColor: '#94a3b8',
                addedBackground: '#064e3b',
                addedColor: '#34d399',
                removedBackground: '#7f1d1d',
                removedColor: '#f87171',
                wordAddedBackground: '#065f46',
                wordRemovedBackground: '#991b1b',
              }
            }
          }}
        />
      </div>
    </ToolLayout>
  );
}
