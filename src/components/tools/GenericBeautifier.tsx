import { useState, useCallback } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { Settings, Wand2 } from 'lucide-react';
import beautify from 'js-beautify';

interface GenericBeautifierProps {
  title: string;
  description: string;
  language: 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'scss' | 'less';
  mode: 'html' | 'css' | 'js'; // js-beautify modes
}

export default function GenericBeautifier({ title, description, language, mode }: GenericBeautifierProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const validateInput = useCallback((val: string) => {
    if (!val.trim()) {
      setError(null);
      return;
    }
    try {
      if (mode === 'html') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(val, 'text/xml');
        if (doc.getElementsByTagName('parsererror').length > 0) {
          // XML/HTML parsing errors are often noisy, so we'll be careful
          // js-beautify is very forgiving, so real-time validation might be too strict
          // But it helps for obvious tag mismatches
        }
      } else if (language === 'json') {
        JSON.parse(val);
      }
      setError(null);
    } catch (err) {
      // Only set error for strict formats like JSON
      if (language === 'json') {
        setError(err instanceof Error ? err.message : 'Invalid JSON');
      }
    }
  }, [mode, language]);

  const handleInputChange = (val: string) => {
    setInput(val);
    validateInput(val);
  };

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

      let formatted = '';
      if (mode === 'html') {
        formatted = beautify.html(input, options);
      } else if (mode === 'css') {
        formatted = beautify.css(input, options);
      } else {
        formatted = beautify.js(input, options);
      }
      setOutput(formatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format code');
    }
  }, [input, indentSize, mode]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    setError(null);
    try {
      // Very basic minification: remove comments and extra whitespace
      // For a real production app, we'd use terser or clean-css
      let minified = input;
      if (mode === 'css' || mode === 'js') {
        minified = input
          .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // remove comments
          .replace(/\s+/g, ' ') // collapse whitespace
          .replace(/\s*([{};:,])\s*/g, '$1') // remove space around separators
          .trim();
      } else if (mode === 'html') {
        minified = input
          .replace(/<!--[\s\S]*?-->/g, '') // remove comments
          .replace(/>\s+</g, '><') // remove space between tags
          .trim();
      }
      setOutput(minified);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to minify code');
    }
  }, [input, mode]);

  return (
    <ToolLayout
      title={title}
      description={description}
      onClear={() => {
        setInput('');
        setOutput('');
        setError(null);
      }}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4 bg-bg-header px-2 py-1 rounded border border-border-subtle">
            <Settings size={12} className="text-text-secondary" />
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="bg-transparent text-[10px] text-text-main outline-none"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={8}>8 Spaces</option>
            </select>
          </div>
          <button
            onClick={handleMinify}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-header hover:bg-neutral-700 text-text-secondary text-xs transition-colors border border-border-subtle"
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
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Input</label>
          <CodeEditor
            value={input}
            onChange={handleInputChange}
            language={language}
            placeholder={`Paste your ${language.toUpperCase()} here...`}
            error={error}
          />
        </div>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
            Output
          </label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language={language}
            readOnly
            placeholder="Formatted output will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
