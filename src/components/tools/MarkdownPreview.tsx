import React, { useState } from 'react';
import ToolLayout from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import Markdown from 'react-markdown';

export default function MarkdownPreview() {
  const [input, setInput] = useState('# Markdown Preview\n\nType your markdown on the left to see the result on the right.\n\n## Features\n\n- **Bold text**\n- *Italic text*\n- [Links](https://google.com)\n- `Inline code`\n\n```js\nconsole.log("Hello World");\n```');

  return (
    <ToolLayout 
      title="Markdown Preview" 
      description="Write markdown and preview it in real-time with standard styling."
      onClear={() => setInput('')}
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
        <div className="flex-1 min-h-0">
          <CodeEditor 
            value={input} 
            onChange={setInput} 
            language="markdown" 
            placeholder="Write your markdown here..."
          />
        </div>

        <div className="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-lg overflow-auto p-8 prose prose-invert prose-blue max-w-none">
          <div className="markdown-body">
            <Markdown>{input}</Markdown>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
