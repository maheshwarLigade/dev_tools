import React, { lazy, Suspense } from 'react';
import { ToolDefinition } from '../../tools';
import { Loader2 } from 'lucide-react';

// Lazy load tool implementations to keep initial bundle small
const JsonFormatter = lazy(() => import('../tools/JsonFormatter'));
const SqlFormatter = lazy(() => import('../tools/SqlFormatter'));
const Base64Tool = lazy(() => import('../tools/Base64Tool'));
const UuidGenerator = lazy(() => import('../tools/UuidGenerator'));
const MarkdownPreview = lazy(() => import('../tools/MarkdownPreview'));
const YamlConverter = lazy(() => import('../tools/YamlConverter'));
const JwtDebugger = lazy(() => import('../tools/JwtDebugger'));
const HashGenerator = lazy(() => import('../tools/HashGenerator'));
const CaseConverter = lazy(() => import('../tools/CaseConverter'));
const DiffChecker = lazy(() => import('../tools/DiffChecker'));
const UrlEncoder = lazy(() => import('../tools/UrlEncoder'));
const QrGenerator = lazy(() => import('../tools/QrGenerator'));
const LoremGenerator = lazy(() => import('../tools/LoremGenerator'));
const UnixTimeConverter = lazy(() => import('../tools/UnixTimeConverter'));
const IpCalculator = lazy(() => import('../tools/IpCalculator'));
const GenericBeautifier = lazy(() => import('../tools/GenericBeautifier'));
const LineTools = lazy(() => import('../tools/LineTools'));
const Base64ImageTool = lazy(() => import('../tools/Base64ImageTool'));
const HtmlEntitiesTool = lazy(() => import('../tools/HtmlEntitiesTool'));
const EscapeUnescapeTool = lazy(() => import('../tools/EscapeUnescapeTool'));
const CertDecoderTool = lazy(() => import('../tools/CertDecoderTool'));
const RegexTester = lazy(() => import('../tools/RegexTester'));
const UrlParser = lazy(() => import('../tools/UrlParser'));
const HtmlToJsx = lazy(() => import('../tools/HtmlToJsx'));
const PhpConverter = lazy(() => import('../tools/PhpConverter'));
const PhpSerializer = lazy(() => import('../tools/PhpSerializer'));
const SvgToCss = lazy(() => import('../tools/SvgToCss'));
const SvgEditor = lazy(() => import('../tools/SvgEditor'));
const CurlToCode = lazy(() => import('../tools/CurlToCode'));
const JsonToCode = lazy(() => import('../tools/JsonToCode'));
const JsonToTypeScript = lazy(() => import('../tools/JsonToTypeScript'));
const JsonToGo = lazy(() => import('../tools/JsonToGo'));
const HexAsciiConverter = lazy(() => import('../tools/HexAsciiConverter'));
const JsonSchemaValidator = lazy(() => import('../tools/JsonSchemaValidator'));
const HtmlPreview = lazy(() => import('../tools/HtmlPreview'));
const StringInspector = lazy(() => import('../tools/StringInspector'));
const CronParser = lazy(() => import('../tools/CronParser'));
const ColorConverter = lazy(() => import('../tools/ColorConverter'));
const MockDataGenerator = lazy(() => import('../tools/MockDataGenerator'));
const ScssFormatter = lazy(() => import('../tools/ScssFormatter'));

const XmlFormatter = lazy(() => import('../tools/XmlFormatter'));
const CsvJsonConverter = lazy(() => import('../tools/CsvJsonConverter'));
const BaseConverter = lazy(() => import('../tools/BaseConverter'));
const Dashboard = lazy(() => import('./Dashboard'));

interface ToolContainerProps {
  tool: ToolDefinition | null;
  onSelectTool?: (id: string) => void;
  searchQuery?: string;
}

export default function ToolContainer({ tool, onSelectTool, searchQuery }: ToolContainerProps) {
  const renderTool = () => {
    if (!tool) return <Dashboard onSelectTool={onSelectTool!} searchQuery={searchQuery || ''} />;

    switch (tool.id) {
      case 'json-format': return <JsonFormatter />;
      case 'sql-format': return <SqlFormatter />;
      case 'xml-format': return <XmlFormatter />;
      case 'base64': return <Base64Tool />;
      case 'base64-image': return <Base64ImageTool />;
      case 'uuid-gen': return <UuidGenerator />;
      case 'markdown-preview': return <MarkdownPreview />;
      case 'yaml-json': return <YamlConverter />;
      case 'json-csv': return <CsvJsonConverter />;
      case 'json-schema-validator': return <JsonSchemaValidator />;
      case 'base-converter': return <BaseConverter />;
      case 'jwt-debugger': return <JwtDebugger />;
      case 'html-preview': return <HtmlPreview />;
      case 'string-inspector': return <StringInspector />;
      case 'cron-parser': return <CronParser />;
      case 'color-converter': return <ColorConverter />;
      case 'mock-gen': return <MockDataGenerator />;
      case 'hash-gen': return <HashGenerator />;
      case 'case-converter': return <CaseConverter />;
      case 'diff-checker': return <DiffChecker />;
      case 'url-encoder': return <UrlEncoder />;
      case 'url-parser': return <UrlParser />;
      case 'regex-tester': return <RegexTester />;
      case 'html-jsx': return <HtmlToJsx />;
      case 'php-json': return <PhpConverter />;
      case 'php-serializer': return <PhpSerializer />;
      case 'svg-css': return <SvgToCss />;
      case 'svg-editor': return <SvgEditor />;
      case 'curl-code': return <CurlToCode />;
      case 'json-code': return <JsonToCode />;
      case 'json-to-ts': return <JsonToTypeScript />;
      case 'json-to-go': return <JsonToGo />;
      case 'hex-ascii': return <HexAsciiConverter />;
      case 'html-entities': return <HtmlEntitiesTool />;
      case 'escape-unescape': return <EscapeUnescapeTool />;
      case 'cert-decoder': return <CertDecoderTool />;
      case 'qr-gen': return <QrGenerator />;
      case 'lorem-gen': return <LoremGenerator />;
      case 'unix-time': return <UnixTimeConverter />;
      case 'ip-calculator': return <IpCalculator />;
      case 'html-format': return <GenericBeautifier title="HTML Formatter" description="Beautify or minify HTML code" language="html" mode="html" />;
      case 'js-format': return <GenericBeautifier title="JS Formatter" description="Beautify or minify JavaScript/TypeScript code" language="javascript" mode="js" />;
      case 'css-format': return <GenericBeautifier title="CSS Formatter" description="Beautify or minify CSS code" language="css" mode="css" />;
      case 'scss-format': return <ScssFormatter />;
      case 'less-format': return <GenericBeautifier title="LESS Formatter" description="Beautify or minify LESS code" language="less" mode="css" />;
      case 'erb-format': return <GenericBeautifier title="ERB Formatter" description="Beautify or minify ERB templates (uses HTML mode)" language="html" mode="html" />;
      case 'line-tools': return <LineTools />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950">
            <tool.icon size={64} className="text-slate-800 mb-4" />
            <h2 className="text-2xl font-bold text-slate-300 mb-2">{tool.name}</h2>
            <p className="text-slate-500 max-w-md">
              This tool is currently in development. Check back soon for full functionality!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-6">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      }>
        {renderTool()}
      </Suspense>
    </div>
  );
}
