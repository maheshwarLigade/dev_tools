import { useState, useCallback } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { Wand2, Settings } from 'lucide-react';
// We'll use js-beautify for now as it's already configured and consistent with other tools,
// but we'll provide a dedicated component for SCSS to allow future SCSS-specific features.
import beautify from 'js-beautify';

export default function ScssFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    setError(null);
    try {
      const options = {
        indent_size: indentSize,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: 'normal',
        brace_style: 'collapse',
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: false,
        wrap_line_length: 0,
        indent_inner_html: false,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false
      };

      // js-beautify's css formatter works reasonably well for SCSS
      const formatted = beautify.css(input, options);
      setOutput(formatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format SCSS');
    }
  }, [input, indentSize]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    setError(null);
    try {
      const minified = input
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // remove comments
        .replace(/\s+/g, ' ') // collapse whitespace
        .replace(/\s*([{};:,])\s*/g, '$1') // remove space around separators
        .trim();
      setOutput(minified);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to minify SCSS');
    }
  }, [input]);

  return (
    <ToolLayout
      title="SCSS Formatter"
      description="Beautify or minify your SCSS code for better readability and performance."
      onClear={() => {
        setInput('');
        setOutput('');
        setError(null);
      }}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4 bg-bg-header px-2 py-1 rounded border border-border-subtle text-text-secondary">
            <Settings size={12} />
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="bg-transparent text-[10px] outline-none text-text-main"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={8}>8 Spaces</option>
            </select>
          </div>
          <button
            onClick={handleMinify}
            className="px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
          >
            Minify
          </button>
          <button
            onClick={handleFormat}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs transition-colors shadow-lg shadow-brand/20"
          >
            <Wand2 size={13} />
            <span>Beautify</span>
          </button>
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">SCSS Input</label>
          <CodeEditor
            value={input}
            onChange={setInput}
            language="scss"
            placeholder="Paste your SCSS code here..."
            error={error}
          />
        </div>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Formatted Output</label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language="scss"
            readOnly
            placeholder="Formatted output will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
