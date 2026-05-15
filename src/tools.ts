import { 
  FileJson, 
  FileCode, 
  FileType, 
  Hash, 
  Settings, 
  Layout, 
  QrCode, 
  Clock, 
  Key, 
  Type, 
  Split, 
  FileText,
  Search,
  RefreshCw,
  Database,
  Link,
  ShieldCheck,
  Binary,
  Globe,
  Code2,
  AlignCenter,
  Terminal,
  Variable,
  Info
} from 'lucide-react';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
}

export const CATEGORIES = [
  "Formatters",
  "Converters",
  "Generators",
  "Encoders/Decoders",
  "Inspectors",
  "Network Tools",
  "Text Tools"
];

export const TOOLS: ToolDefinition[] = [
  // Formatters
  {
    id: 'json-format',
    name: 'JSON Formatter',
    description: 'Format, validate and minify JSON data',
    category: 'Formatters',
    icon: FileJson
  },
  {
    id: 'sql-format',
    name: 'SQL Formatter',
    description: 'Format and beautify SQL queries',
    category: 'Formatters',
    icon: Database
  },
  {
    id: 'xml-format',
    name: 'XML Formatter',
    description: 'Beautify or minify XML content',
    category: 'Formatters',
    icon: FileCode
  },
  {
    id: 'html-format',
    name: 'HTML Formatter',
    description: 'Beautify or minify HTML content',
    category: 'Formatters',
    icon: Layout
  },
  {
    id: 'js-format',
    name: 'JS Formatter',
    description: 'Beautify or minify JavaScript/TypeScript',
    category: 'Formatters',
    icon: Code2
  },
  {
    id: 'css-format',
    name: 'CSS Formatter',
    description: 'Beautify or minify CSS code',
    category: 'Formatters',
    icon: Type
  },
  {
    id: 'scss-format',
    name: 'SCSS Formatter',
    description: 'Beautify or minify SCSS code',
    category: 'Formatters',
    icon: Type
  },
  {
    id: 'less-format',
    name: 'LESS Formatter',
    description: 'Beautify or minify LESS code',
    category: 'Formatters',
    icon: Type
  },
  {
    id: 'erb-format',
    name: 'ERB Formatter',
    description: 'Format or beautify ERB templates',
    category: 'Formatters',
    icon: Layout
  },
  
  // Converters
  {
    id: 'yaml-json',
    name: 'YAML/JSON',
    description: 'Convert between YAML and JSON formats',
    category: 'Converters',
    icon: RefreshCw
  },
  {
    id: 'json-csv',
    name: 'JSON/CSV',
    description: 'Convert between JSON and CSV formats',
    category: 'Converters',
    icon: FileType
  },
  {
    id: 'base-converter',
    name: 'Base Converter',
    description: 'Convert numbers between Binary, Dec, Hex',
    category: 'Converters',
    icon: Binary
  },
  {
    id: 'html-jsx',
    name: 'HTML to JSX',
    description: 'Convert HTML code snippets to React JSX',
    category: 'Converters',
    icon: Code2
  },
  {
    id: 'php-json',
    name: 'PHP Array/JSON',
    description: 'Convert between PHP arrays and JSON',
    category: 'Converters',
    icon: RefreshCw
  },
  {
    id: 'php-serializer',
    name: 'PHP Serializer',
    description: 'Serialize and unserialize PHP data',
    category: 'Converters',
    icon: RefreshCw
  },
  {
    id: 'svg-editor',
    name: 'SVG Editor',
    description: 'Edit SVG code with real-time live preview and optimization',
    category: 'Formatters',
    icon: FileCode
  },
  {
    id: 'svg-css',
    name: 'SVG to CSS',
    description: 'Convert SVG to CSS background image',
    category: 'Converters',
    icon: FileCode
  },
  {
    id: 'curl-code',
    name: 'cURL to Code',
    description: 'Convert cURL commands to different languages',
    category: 'Converters',
    icon: Terminal
  },
  {
    id: 'json-code',
    name: 'JSON to Code',
    description: 'Convert JSON to Typescript, Go, and more',
    category: 'Converters',
    icon: Variable
  },
  {
    id: 'json-to-go',
    name: 'JSON to Go Struct',
    description: 'Convert JSON to idiomatic Go structs with JSON tags',
    category: 'Converters',
    icon: Code2
  },
  {
    id: 'json-to-ts',
    name: 'JSON to TypeScript',
    description: 'Convert JSON to nested TypeScript interfaces or types',
    category: 'Converters',
    icon: Code2
  },
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Validator',
    description: 'Validate JSON data against a JSON Schema (Draft 7/2019-09)',
    category: 'Converters',
    icon: ShieldCheck
  },

  // Generators
  {
    id: 'uuid-gen',
    name: 'UUID/ULID',
    description: 'Generate unique identifiers',
    category: 'Generators',
    icon: Key
  },
  {
    id: 'hash-gen',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256 hashes',
    category: 'Generators',
    icon: ShieldCheck
  },
  {
    id: 'qr-gen',
    name: 'QR Code',
    description: 'Generate QR codes from text',
    category: 'Generators',
    icon: QrCode
  },
  {
    id: 'lorem-gen',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text',
    category: 'Generators',
    icon: FileText
  },
  {
    id: 'mock-gen',
    name: 'Mock Data Generator',
    description: 'Generate realistic mock data from a schema or template',
    category: 'Generators',
    icon: Database
  },

  // Encoders/Decoders
  {
    id: 'base64',
    name: 'Base64 Text',
    description: 'Encode or decode Base64 strings',
    category: 'Encoders/Decoders',
    icon: Hash
  },
  {
    id: 'base64-image',
    name: 'Base64 Image',
    description: 'Convert images to Base64 strings and vice versa',
    category: 'Encoders/Decoders',
    icon: FileType
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'URL encode or decode strings',
    category: 'Encoders/Decoders',
    icon: Link
  },
  {
    id: 'html-entities',
    name: 'HTML Entities',
    description: 'Encode or decode HTML entities',
    category: 'Encoders/Decoders',
    icon: FileCode
  },
  {
    id: 'escape-unescape',
    name: 'Escape/Unescape',
    description: 'Escape or unescape backslashes and special characters',
    category: 'Encoders/Decoders',
    icon: Hash
  },
  {
    id: 'cert-decoder',
    name: 'Certificate Decoder',
    description: 'Decode X.509 certificates to human-readable format',
    category: 'Encoders/Decoders',
    icon: ShieldCheck
  },
  {
    id: 'hex-ascii',
    name: 'Hex/ASCII',
    description: 'Convert between Hex and ASCII strings',
    category: 'Encoders/Decoders',
    icon: Binary
  },

  // Inspectors
  {
    id: 'jwt-debugger',
    name: 'JWT Debugger',
    description: 'Decode and inspect JSON Web Tokens',
    category: 'Inspectors',
    icon: ShieldCheck
  },
  {
    id: 'markdown-preview',
    name: 'Markdown',
    description: 'Real-time Markdown previewer',
    category: 'Inspectors',
    icon: Layout
  },
  {
    id: 'unix-time',
    name: 'Unix Time',
    description: 'Convert Unix timestamps for human readability',
    category: 'Inspectors',
    icon: Clock
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with highlighting',
    category: 'Inspectors',
    icon: Search
  },
  {
    id: 'html-preview',
    name: 'HTML Preview',
    description: 'Live preview for HTML and CSS snippets',
    category: 'Inspectors',
    icon: Layout
  },
  {
    id: 'string-inspector',
    name: 'String Inspector',
    description: 'Detailed text statistics and inspection',
    category: 'Inspectors',
    icon: Info
  },
  {
    id: 'cron-parser',
    name: 'Cron Parser',
    description: 'Parse cron expressions into human-readable text',
    category: 'Inspectors',
    icon: Clock
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL, and CMYK colors',
    category: 'Inspectors',
    icon: Type
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse URL strings and extract parameters',
    category: 'Inspectors',
    icon: Link
  },

  // Network Tools
  {
    id: 'ip-calculator',
    name: 'IP Calculator',
    description: 'Subnetting and CIDR conversion calculator',
    category: 'Network Tools',
    icon: Globe
  },

  // Text Tools
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Change text case (camel, snake, kebab, etc)',
    category: 'Text Tools',
    icon: Type
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker',
    description: 'Compare two text files for changes',
    category: 'Text Tools',
    icon: Split
  },
  {
    id: 'line-tools',
    name: 'Line Sort/Dedupe',
    description: 'Sort lines, remove duplicates, and clean text',
    category: 'Text Tools',
    icon: AlignCenter
  }
];
